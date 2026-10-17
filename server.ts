import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { queryTerminalReel, classifyCampusIssue } from "./server/ai";
import { dispatchEmail, verifySMTPConnection } from "./server/services/smtp";
import { PriorityLevel, Staff } from "./src/types";
import XLSX from 'xlsx';
import { buildUnifiedStudentsDirectory } from "./server/services/studentImporter";

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // ==========================================
  // API ROUTES (Mounted before Vite middleware)
  // ==========================================

  // 1. Health & Status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      platform: "Devora AI — Campus & Administration Operations Engine",
      emailGateway: "SMTP Nodemailer",
      timestamp: new Date().toISOString()
    });
  });

  // 2. Executive Daily Operations Brief & Analytics
  app.get("/api/overview", (req, res) => {
    const brief = db.getDailyBrief();
    res.json({
      brief,
      counts: {
        totalStudents: db.students.length,
        totalStaff: db.staff.length,
        openMaintenance: db.maintenance.filter(m => m.status !== 'RESOLVED').length,
        pendingRequests: db.requests.filter(r => r.status === 'PENDING').length,
        pendingLeave: db.leaveRequests.filter(l => l.status === 'PENDING').length,
        unreadNotifications: db.notifications.filter(n => !n.read).length
      }
    });
  });

  // 3. AI Terminal Reel & Assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { question, dials } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question parameter is required." });
      }

      const answer = await queryTerminalReel(question, dials || {
        style: 50,
        length: 50,
        tone: 50,
        priority: 50
      });

      res.json({ answer });
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      res.status(500).json({ error: err.message || "Failed to process question." });
    }
  });

  // 4. AI Issue & Request Auto-Classification
  app.post("/api/ai/classify", async (req, res) => {
    try {
      const { title, description, location } = req.body;
      const result = await classifyCampusIssue(title, description, location);
      res.json(result);
    } catch (err: any) {
      console.error("AI Classify Error:", err);
      res.status(500).json({ error: err.message || "Classification failed." });
    }
  });

  // 5. Students Management
  app.get("/api/students", (req, res) => {
    res.json(db.students);
  });

  app.post("/api/students", async (req, res) => {
    const studentPassword = req.body.password?.trim() || 'student123';
    const newStudent = {
      id: `stu-${Date.now()}`,
      ...req.body,
      attendance_rate: 100,
      status: req.body.status || 'ACTIVE',
      password: studentPassword
    };
    db.students.push(newStudent);

    // Automatically send credentials email to student's registered email
    const studentEmail = (newStudent.email || newStudent.guardian_email || '').trim();
    if (studentEmail) {
      const host = req.headers.host || 'localhost:3001';
      const protocol = req.protocol || 'http';
      const origin = req.headers.origin || `${protocol}://${host}`;

      const studentHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FFF8EC; border: 1px solid #E8DDCA; border-radius: 16px; overflow: hidden; color: #2B2020;">
          <div style="background-color: #6B1E2B; padding: 24px 28px; text-align: left;">
            <h1 style="color: #FFF8EC; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">DEVORA AI</h1>
            <p style="color: rgba(255,248,236,0.8); margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Student Portal Credentials &amp; Enrollment</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="color: #2B2020; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">Welcome to Devora Campus, ${newStudent.name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A3A3A; margin: 0 0 16px 0;">
              You have been enrolled in the Devora Campus System. Below are your login credentials to access the student portal:
            </p>
            
            <div style="background-color: #FFFFFF; border: 1px solid rgba(107,30,43,0.15); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600; width: 40%;">Username / Name:</td>
                  <td style="padding: 6px 0; color: #2B2020; font-weight: 700;">${newStudent.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Registered Login Email:</td>
                  <td style="padding: 6px 0; color: #2B2020; font-weight: 700;">${studentEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Student Portal Password:</td>
                  <td style="padding: 6px 0; color: #6B1E2B; font-weight: 800; font-family: monospace; font-size: 15px;">${studentPassword}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Admission / Roll Number:</td>
                  <td style="padding: 6px 0; color: #2B2020;">${newStudent.roll_number}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Class Grade &amp; Section:</td>
                  <td style="padding: 6px 0; color: #2B2020;">Grade ${newStudent.class_grade || '8'} - Section ${newStudent.section || 'A'}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 24px 0 20px 0;">
              <a href="${origin}" style="background-color: #6B1E2B; color: #FFFFFF; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(107,30,43,0.2);">
                Login to Student Portal
              </a>
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #756565; margin: 20px 0 0 0; border-top: 1px solid #E8DDCA; padding-top: 16px;">
              You can log in to view real-time class attendance, timetable schedules, and campus alerts.
            </p>
          </div>
        </div>
      `;

      try {
        const emailRes = await dispatchEmail(
          studentEmail,
          `Welcome to Devora Campus — Student Portal Credentials for ${newStudent.name}`,
          `Welcome to Devora Campus, ${newStudent.name}!\n\nYour username: ${newStudent.name}\nRegistered login email: ${studentEmail}\nPassword: ${studentPassword}\nRoll No: ${newStudent.roll_number}\n\nLogin link: ${origin}`,
          {
            recipientName: newStudent.name,
            triggerEvent: 'Student Enrollment',
            htmlContent: studentHtml
          }
        );

        db.emailLogs.unshift({
          id: `email-${Date.now()}`,
          recipient_email: studentEmail,
          recipient_name: newStudent.name,
          subject: `Welcome to Devora Campus — Student Portal Credentials for ${newStudent.name}`,
          message: `Onboarding credentials dispatched to student ${newStudent.name} (${studentEmail}).`,
          template_id: 'DEVORA_STUDENT_ONBOARDING',
          status: emailRes.status,
          trigger_event: 'Student Enrollment',
          created_at: new Date().toISOString()
        });
      } catch (err: any) {
        console.warn(`[STUDENT ONBOARDING EMAIL] Warning: ${err.message}`);
      }
    }

    db.saveToFile();
    res.status(201).json(newStudent);
  });

  app.patch("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const updated = db.updateStudent(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updated);
  });

  // Admin Update Student Password
  app.put("/api/students/:id/password", async (req, res) => {
    const { id } = req.params;
    const { password, notify } = req.body;
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "New password is required" });
    }

    const student = db.students.find(s => s.id === id || s.roll_number === id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.password = password.trim();

    const studentEmail = (student.email || student.guardian_email || '').trim();
    if (notify !== false && studentEmail) {
      const host = req.headers.host || 'localhost:3001';
      const protocol = req.protocol || 'http';
      const origin = req.headers.origin || `${protocol}://${host}`;

      const updateHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FFF8EC; border: 1px solid #E8DDCA; border-radius: 16px; overflow: hidden; color: #2B2020;">
          <div style="background-color: #6B1E2B; padding: 24px 28px; text-align: left;">
            <h1 style="color: #FFF8EC; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">DEVORA AI</h1>
            <p style="color: rgba(255,248,236,0.8); margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Admin Security Update</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="color: #2B2020; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">Password Updated by Campus Administration</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A3A3A; margin: 0 0 16px 0;">
              Hello <strong>${student.name}</strong>,<br><br>
              The campus administrator has updated the password for your Devora Student Portal account.
            </p>
            
            <div style="background-color: #FFFFFF; border: 1px solid rgba(107,30,43,0.15); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600; width: 40%;">Student Name:</td>
                  <td style="padding: 6px 0; color: #2B2020; font-weight: 700;">${student.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Login Identifier:</td>
                  <td style="padding: 6px 0; color: #2B2020; font-weight: 700;">${studentEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">New Password:</td>
                  <td style="padding: 6px 0; color: #6B1E2B; font-weight: 800; font-family: monospace; font-size: 16px;">${password.trim()}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 24px 0 20px 0;">
              <a href="${origin}" style="background-color: #6B1E2B; color: #FFFFFF; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block;">
                Login to Student Portal
              </a>
            </div>
          </div>
        </div>
      `;

      try {
        const emailRes = await dispatchEmail(
          studentEmail,
          `Devora Campus — Student Password Updated by Administrator for ${student.name}`,
          `Hello ${student.name},\n\nYour student portal password has been updated by the campus administrator to: ${password.trim()}\n\nLogin link: ${origin}`,
          {
            recipientName: student.name,
            triggerEvent: 'Admin Password Reset',
            htmlContent: updateHtml
          }
        );

        db.emailLogs.unshift({
          id: `email-${Date.now()}`,
          recipient_email: studentEmail,
          recipient_name: student.name,
          subject: `Devora Campus — Student Password Updated for ${student.name}`,
          message: `Admin updated password for student ${student.name} (${studentEmail}).`,
          template_id: 'DEVORA_ADMIN_PASSWORD_UPDATE',
          status: emailRes.status,
          trigger_event: 'Admin Password Reset',
          created_at: new Date().toISOString()
        });
      } catch (err: any) {
        console.warn(`[STUDENT PASSWORD UPDATE EMAIL] Warning: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Password updated successfully for ${student.name}`,
      student
    });
  });

  // Admin Delete Student
  app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const initialLen = db.students.length;
    db.students = db.students.filter(s => s.id !== id && s.roll_number !== id);
    res.json({ success: db.students.length < initialLen });
  });

  // 6. Staff & Faculty Directory
  app.get("/api/staff", (req, res) => {
    res.json(db.staff);
  });

  app.post("/api/staff", async (req, res) => {
    const { name, role_title, department, email, phone, employee_id, assigned_classes, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const isTeacher = role_title === 'Teacher' || !role_title;
    const prefix = isTeacher ? 'tch' : role_title === 'Administration' ? 'adm' : 'stf';
    const count = db.staff.length + 1;
    const empId = employee_id?.trim() || `EMP-${prefix.toUpperCase()}-${String(count).padStart(2, '0')}`;

    let classes: string[] = [];
    if (Array.isArray(assigned_classes)) {
      classes = assigned_classes;
    } else if (typeof assigned_classes === 'string' && assigned_classes.trim()) {
      classes = assigned_classes.split(',').map((c: string) => c.trim()).filter(Boolean);
    }

    const staffPassword = req.body.password?.trim() || 'teacher123';

    const newStaff: Staff = {
      id: `usr-${prefix}-${Date.now().toString(36)}`,
      name: name.trim(),
      employee_id: empId,
      role_title: role_title || 'Teacher',
      department: department || (isTeacher ? 'Academics' : 'Operations'),
      email: email.trim(),
      phone: phone?.trim() || '+15550190000',
      status: (status === 'ON_LEAVE' ? 'ON_LEAVE' : 'ACTIVE'),
      assigned_classes: classes,
      password: staffPassword
    };

    db.staff.push(newStaff);

    // Automatically send credentials email to faculty/teacher's registered email
    if (newStaff.email) {
      const host = req.headers.host || 'localhost:3001';
      const protocol = req.protocol || 'http';
      const origin = req.headers.origin || `${protocol}://${host}`;

      const staffHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FFF8EC; border: 1px solid #E8DDCA; border-radius: 16px; overflow: hidden; color: #2B2020;">
          <div style="background-color: #6B1E2B; padding: 24px 28px; text-align: left;">
            <h1 style="color: #FFF8EC; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">DEVORA AI</h1>
            <p style="color: rgba(255,248,236,0.8); margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Campus Faculty &amp; Staff Credentials</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="color: #2B2020; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">Welcome to Devora Campus, ${newStaff.name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A3A3A; margin: 0 0 16px 0;">
              Your official account has been created on the Devora Campus Operations System. Below are your login credentials:
            </p>
            
            <div style="background-color: #FFFFFF; border: 1px solid rgba(107,30,43,0.15); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600; width: 40%;">Username / Name:</td>
                  <td style="padding: 6px 0; color: #2B2020; font-weight: 700;">${newStaff.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Registered Email:</td>
                  <td style="padding: 6px 0; color: #2B2020; font-weight: 700;">${newStaff.email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Portal Password:</td>
                  <td style="padding: 6px 0; color: #6B1E2B; font-weight: 800; font-family: monospace; font-size: 15px;">${staffPassword}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Role &amp; Department:</td>
                  <td style="padding: 6px 0; color: #2B2020;">${newStaff.role_title} · ${newStaff.department}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #756565; font-weight: 600;">Employee ID:</td>
                  <td style="padding: 6px 0; color: #2B2020;">${newStaff.employee_id}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 24px 0 20px 0;">
              <a href="${origin}" style="background-color: #6B1E2B; color: #FFFFFF; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(107,30,43,0.2);">
                Login to Faculty Portal
              </a>
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #756565; margin: 20px 0 0 0; border-top: 1px solid #E8DDCA; padding-top: 16px;">
              You can log in at any time using your registered email and password. If you ever need to change your password, use the "Forgot password?" option on the login page.
            </p>
          </div>
        </div>
      `;

      try {
        const emailRes = await dispatchEmail(
          newStaff.email,
          `Welcome to Devora Campus — ${newStaff.role_title} Credentials for ${newStaff.name}`,
          `Welcome to Devora Campus, ${newStaff.name}!\n\nYour username: ${newStaff.name}\nRegistered login email: ${newStaff.email}\nPassword: ${staffPassword}\nEmployee ID: ${newStaff.employee_id}\nRole: ${newStaff.role_title} (${newStaff.department})\n\nLogin link: ${origin}`,
          {
            recipientName: newStaff.name,
            triggerEvent: 'Staff & Faculty Onboarding',
            htmlContent: staffHtml
          }
        );

        db.emailLogs.unshift({
          id: `email-${Date.now()}`,
          recipient_email: newStaff.email,
          recipient_name: newStaff.name,
          subject: `Welcome to Devora Campus — ${newStaff.role_title} Credentials for ${newStaff.name}`,
          message: `Onboarding credentials dispatched to ${newStaff.name} (${newStaff.email}).`,
          template_id: 'DEVORA_STAFF_ONBOARDING',
          status: emailRes.status,
          trigger_event: 'Staff & Faculty Onboarding',
          created_at: new Date().toISOString()
        });
      } catch (err: any) {
        console.warn(`[STAFF ONBOARDING EMAIL] Warning: ${err.message}`);
      }
    }

    res.status(201).json(newStaff);
  });

  app.delete("/api/staff/:id", (req, res) => {
    const { id } = req.params;
    const initialLen = db.staff.length;
    db.staff = db.staff.filter(s => s.id !== id);
    res.json({ success: db.staff.length < initialLen });
  });

  // Admin Update Staff Password
  app.put("/api/staff/:id/password", async (req, res) => {
    const { id } = req.params;
    const { password, notify } = req.body;
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "New password is required" });
    }

    const staffMember = db.staff.find(s => s.id === id || s.employee_id === id);
    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    staffMember.password = password.trim();

    if (notify !== false && staffMember.email) {
      const host = req.headers.host || 'localhost:3001';
      const protocol = req.protocol || 'http';
      const origin = req.headers.origin || `${protocol}://${host}`;

      try {
        const emailRes = await dispatchEmail(
          staffMember.email,
          `Devora Campus — Password Updated by Administrator for ${staffMember.name}`,
          `Hello ${staffMember.name},\n\nYour portal login password has been updated by the campus administrator to: ${password.trim()}\n\nLogin link: ${origin}`,
          {
            recipientName: staffMember.name,
            triggerEvent: 'Admin Password Reset'
          }
        );

        db.emailLogs.unshift({
          id: `email-${Date.now()}`,
          recipient_email: staffMember.email,
          recipient_name: staffMember.name,
          subject: `Devora Campus — Staff Password Updated for ${staffMember.name}`,
          message: `Admin updated password for ${staffMember.name} (${staffMember.email}).`,
          template_id: 'DEVORA_ADMIN_PASSWORD_UPDATE',
          status: emailRes.status,
          trigger_event: 'Admin Password Reset',
          created_at: new Date().toISOString()
        });
      } catch (err: any) {
        console.warn(`[STAFF PASSWORD UPDATE EMAIL] Warning: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Password updated successfully for ${staffMember.name}`,
      staff: staffMember
    });
  });

  // 7. Attendance API & AI Attendance Analysis
  app.get("/api/attendance", (req, res) => {
    const { class_grade, section, date } = req.query;
    let records = db.attendance;
    if (class_grade) {
      records = records.filter(r => r.class_grade === String(class_grade));
    }
    if (section) {
      records = records.filter(r => r.section === String(section));
    }
    if (date) {
      records = records.filter(r => r.date === String(date));
    }

    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

    res.json({
      records,
      stats: {
        total_students: records.length,
        present_count: present,
        absent_count: absent,
        rate_percentage: rate,
        flagged_chronic: absent > 2
      }
    });
  });

  app.post("/api/attendance", (req, res) => {
    const { class_grade, section, date, entries } = req.body;
    if (Array.isArray(entries)) {
      entries.forEach((entry: any) => {
        const existingIdx = db.attendance.findIndex(
          a => a.student_id === entry.student_id && a.date === (date || new Date().toISOString().split('T')[0])
        );
        const record = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          student_id: entry.student_id,
          student_name: entry.student_name,
          class_grade,
          section,
          date: date || new Date().toISOString().split('T')[0],
          status: entry.status,
          notes: entry.notes || ''
        };
        if (existingIdx >= 0) {
          db.attendance[existingIdx] = record;
        } else {
          db.attendance.push(record);
        }
      });
    }

    res.json({ success: true, count: entries?.length || 0 });
  });

  // ==========================================
  // DYNAMIC ACADEMIC CONFIGURATION ENDPOINTS
  // ==========================================

  // Courses
  app.get("/api/academic/courses", (req, res) => {
    res.json(db.courses);
  });

  app.post("/api/academic/courses", (req, res) => {
    const { code, name, description, duration_years, status } = req.body;
    if (!code || !name) return res.status(400).json({ error: "Code and name are required." });
    const newCourse = {
      id: `crs-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description: description || '',
      duration_years: Number(duration_years) || 3,
      status: status || 'ACTIVE',
      created_at: new Date().toISOString()
    };
    db.courses.push(newCourse);
    res.status(201).json(newCourse);
  });

  app.patch("/api/academic/courses/:id", (req, res) => {
    const { id } = req.params;
    const course = db.courses.find(c => c.id === id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    Object.assign(course, req.body);
    res.json(course);
  });

  // Academic Years
  app.get("/api/academic/years", (req, res) => {
    res.json(db.academicYears);
  });

  app.post("/api/academic/years", (req, res) => {
    const { name, start_date, end_date, is_current, status } = req.body;
    if (!name) return res.status(400).json({ error: "Academic year name is required." });
    if (is_current) {
      db.academicYears.forEach(y => { y.is_current = false; });
    }
    const newYear = {
      id: `ay-${Date.now()}`,
      name: name.trim(),
      start_date: start_date || '2026-06-01',
      end_date: end_date || '2027-05-31',
      is_current: Boolean(is_current),
      status: status || 'ACTIVE'
    };
    db.academicYears.push(newYear);
    res.status(201).json(newYear);
  });

  app.patch("/api/academic/years/:id", (req, res) => {
    const { id } = req.params;
    const year = db.academicYears.find(y => y.id === id);
    if (!year) return res.status(404).json({ error: "Academic year not found" });
    if (req.body.is_current) {
      db.academicYears.forEach(y => { y.is_current = false; });
    }
    Object.assign(year, req.body);
    res.json(year);
  });

  // Semesters
  app.get("/api/academic/semesters", (req, res) => {
    const { course_id } = req.query;
    let list = db.semesters;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    res.json(list);
  });

  app.post("/api/academic/semesters", (req, res) => {
    const { course_id, number, name, status } = req.body;
    if (!course_id || !number || !name) return res.status(400).json({ error: "course_id, number and name are required." });
    const newSem = {
      id: `sem-${Date.now()}`,
      course_id,
      number: Number(number),
      name: name.trim(),
      status: status || 'ACTIVE'
    };
    db.semesters.push(newSem);
    res.status(201).json(newSem);
  });

  app.patch("/api/academic/semesters/:id", (req, res) => {
    const { id } = req.params;
    const sem = db.semesters.find(s => s.id === id);
    if (!sem) return res.status(404).json({ error: "Semester not found" });
    Object.assign(sem, req.body);
    res.json(sem);
  });

  // Sections
  app.get("/api/academic/sections", (req, res) => {
    const { course_id, semester_id } = req.query;
    let list = db.sections;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    if (semester_id) list = list.filter(s => s.semester_id === String(semester_id));
    res.json(list);
  });

  app.post("/api/academic/sections", (req, res) => {
    const { course_id, semester_id, name, status } = req.body;
    if (!course_id || !semester_id || !name) return res.status(400).json({ error: "course_id, semester_id and name are required." });
    const newSec = {
      id: `sec-${Date.now()}`,
      course_id,
      semester_id,
      name: name.trim(),
      status: status || 'ACTIVE'
    };
    db.sections.push(newSec);
    res.status(201).json(newSec);
  });

  app.patch("/api/academic/sections/:id", (req, res) => {
    const { id } = req.params;
    const sec = db.sections.find(s => s.id === id);
    if (!sec) return res.status(404).json({ error: "Section not found" });
    Object.assign(sec, req.body);
    res.json(sec);
  });

  // Subjects
  app.get("/api/academic/subjects", (req, res) => {
    const { course_id, semester_id } = req.query;
    let list = db.subjects;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    if (semester_id) list = list.filter(s => s.semester_id === String(semester_id));
    res.json(list);
  });

  app.post("/api/academic/subjects", (req, res) => {
    const { code, name, course_id, semester_id, credits, hours_per_week, status } = req.body;
    if (!code || !name || !course_id || !semester_id) {
      return res.status(400).json({ error: "code, name, course_id, and semester_id are required." });
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      course_id,
      semester_id,
      credits: Number(credits) || 4,
      hours_per_week: Number(hours_per_week) || 4,
      status: status || 'ACTIVE'
    };
    db.subjects.push(newSub);
    res.status(201).json(newSub);
  });

  app.patch("/api/academic/subjects/:id", (req, res) => {
    const { id } = req.params;
    const sub = db.subjects.find(s => s.id === id);
    if (!sub) return res.status(404).json({ error: "Subject not found" });
    Object.assign(sub, req.body);
    res.json(sub);
  });

  // Teacher Assignments
  app.get("/api/academic/assignments", (req, res) => {
    const { teacher_id } = req.query;
    let list = db.teacherAssignments;
    if (teacher_id) list = list.filter(a => a.teacher_id === String(teacher_id));
    res.json(list);
  });

  app.post("/api/academic/assignments", (req, res) => {
    const { teacher_id, course_id, academic_year_id, semester_id, section_id, subject_id, status } = req.body;
    if (!teacher_id || !course_id || !academic_year_id || !semester_id || !section_id || !subject_id) {
      return res.status(400).json({ error: "All assignment parameters are required." });
    }

    const teacher = db.staff.find(s => s.id === teacher_id);
    const course = db.courses.find(c => c.id === course_id);
    const ay = db.academicYears.find(y => y.id === academic_year_id);
    const sem = db.semesters.find(s => s.id === semester_id);
    const sec = db.sections.find(s => s.id === section_id);
    const sub = db.subjects.find(s => s.id === subject_id);

    const newAssignment = {
      id: `asn-${Date.now()}`,
      teacher_id,
      teacher_name: teacher?.name || 'Teacher',
      course_id,
      course_code: course?.code || 'BCA',
      academic_year_id,
      academic_year_name: ay?.name || '2026-27',
      semester_id,
      semester_name: sem?.name || 'Semester',
      section_id,
      section_name: sec?.name || 'Section',
      subject_id,
      subject_name: sub?.name || 'Subject',
      subject_code: sub?.code || 'SUB',
      status: status || 'ACTIVE'
    };

    db.teacherAssignments.push(newAssignment);
    res.status(201).json(newAssignment);
  });

  app.delete("/api/academic/assignments/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.teacherAssignments.findIndex(a => a.id === id);
    if (idx < 0) return res.status(404).json({ error: "Assignment not found" });
    db.teacherAssignments.splice(idx, 1);
    res.json({ success: true });
  });

  // Filtered Academic Students
  app.get("/api/academic/students", (req, res) => {
    const { course_id, academic_year_id, semester_id, section_id } = req.query;
    let list = db.students;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    if (academic_year_id) list = list.filter(s => s.academic_year_id === String(academic_year_id));
    if (semester_id) list = list.filter(s => s.semester_id === String(semester_id));
    if (section_id) {
      const sec = db.sections.find(s => s.id === String(section_id));
      if (sec) list = list.filter(s => s.section === sec.name);
    }
    res.json(list);
  });

  // Attendance Settings
  app.get("/api/academic/settings", (req, res) => {
    res.json(db.attendanceSettings);
  });

  app.patch("/api/academic/settings", (req, res) => {
    Object.assign(db.attendanceSettings, req.body);
    res.json(db.attendanceSettings);
  });

  // Student Promotion
  app.post("/api/academic/promote", (req, res) => {
    const { from_year_id, from_semester_id, from_section_id, to_year_id, to_semester_id, to_section_id, student_ids } = req.body;
    if (!to_year_id || !to_semester_id || !to_section_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "Target year, semester, section, and student_ids array are required." });
    }

    const result = db.promoteStudents({
      from_year_id,
      from_semester_id,
      from_section_id,
      to_year_id,
      to_semester_id,
      to_section_id,
      student_ids
    });

    res.json(result);
  });

  // ==========================================
  // DYNAMIC ATTENDANCE MANAGEMENT ENDPOINTS
  // ==========================================

  // Check / Get existing attendance session
  app.get("/api/attendance/session", (req, res) => {
    const { course_id, academic_year_id, semester_id, section_id, subject_id, date, session_name } = req.query;
    const session = db.attendanceSessions.find(s =>
      s.course_id === String(course_id) &&
      s.academic_year_id === String(academic_year_id) &&
      s.semester_id === String(semester_id) &&
      s.section_id === String(section_id) &&
      s.subject_id === String(subject_id) &&
      s.date === String(date) &&
      (!session_name || s.session_name.toLowerCase() === String(session_name).toLowerCase())
    );

    if (!session) {
      return res.json({ session: null, entries: [] });
    }

    const entries = db.attendanceEntries.filter(e => e.session_id === session.id);
    res.json({ session, entries });
  });

  // Save / Record Attendance Session
  app.post("/api/attendance/session", (req, res) => {
    const {
      course_id,
      academic_year_id,
      semester_id,
      section_id,
      subject_id,
      date,
      session_name,
      recorded_by,
      recorded_by_name,
      entries,
      force_update
    } = req.body;

    if (!course_id || !academic_year_id || !semester_id || !section_id || !subject_id || !date || !Array.isArray(entries)) {
      return res.status(400).json({ error: "Missing required attendance session fields." });
    }

    const result = db.saveAttendanceSession({
      course_id,
      academic_year_id,
      semester_id,
      section_id,
      subject_id,
      date,
      session_name: session_name || 'Regular Lecture',
      recorded_by: recorded_by || 'usr-tch-08',
      recorded_by_name: recorded_by_name || 'Teacher',
      entries,
      force_update: Boolean(force_update)
    });

    if (!result.success) {
      return res.status(409).json(result); // Duplicate session alert
    }

    res.status(result.is_update ? 200 : 201).json(result);
  });

  // Admin Attendance Dashboard Overview
  app.get("/api/attendance/admin-overview", (req, res) => {
    const { course_id, academic_year_id, semester_id, section_id } = req.query;
    const overview = db.getAdminAttendanceOverview({
      course_id: course_id ? String(course_id) : undefined,
      academic_year_id: academic_year_id ? String(academic_year_id) : undefined,
      semester_id: semester_id ? String(semester_id) : undefined,
      section_id: section_id ? String(section_id) : undefined
    });
    res.json(overview);
  });

  // Student Personal Attendance Overview
  app.get("/api/attendance/student/:studentId", (req, res) => {
    const { studentId } = req.params;
    const summary = db.getStudentAttendanceSummary(studentId);
    if (!summary) {
      return res.status(404).json({ error: "Student attendance records not found." });
    }
    res.json(summary);
  });

  // Teacher Assigned Classes
  app.get("/api/attendance/teacher/:teacherId", (req, res) => {
    const { teacherId } = req.params;
    const teacher = db.staff.find(s => s.id === teacherId || s.name.toLowerCase().includes(teacherId.toLowerCase()));
    const actualTeacherId = teacher ? teacher.id : teacherId;

    const assignments = db.teacherAssignments.filter(a => a.teacher_id === actualTeacherId && a.status === 'ACTIVE');
    const recentSessions = db.attendanceSessions.filter(s => s.recorded_by === actualTeacherId).slice(0, 10);

    res.json({
      teacher: teacher || { id: teacherId, name: 'Faculty Member' },
      assignments,
      recent_sessions: recentSessions
    });
  });

  // AI Attendance Insights
  app.get("/api/attendance/ai-insights", (req, res) => {
    const insights = db.getAIAttendanceInsights();
    res.json({ insights });
  });

  // Monthly & Daily Attendance Summary Report
  app.get("/api/attendance/monthly-summary", (req, res) => {
    const { semester_id, section_id, month } = req.query;
    const summary = db.getMonthlyAttendanceSummary({
      semester_id: semester_id ? String(semester_id) : undefined,
      section_id: section_id ? String(section_id) : undefined,
      month: month ? String(month) : undefined
    });
    res.json(summary);
  });

  // Export Attendance Report to Excel or CSV
  app.get("/api/attendance/export", (req, res) => {
    try {
      const { semester_id, section_id, date, month, format } = req.query;
      const rows = db.getAttendanceExportRows({
        semester_id: semester_id ? String(semester_id) : undefined,
        section_id: section_id ? String(section_id) : undefined,
        date: date ? String(date) : undefined,
        month: month ? String(month) : undefined
      });

      const exportFormat = String(format || 'xlsx').toLowerCase();
      const filenameBase = `Devora_Attendance_Report_${date || month || new Date().toISOString().split('T')[0]}`;

      const wb = XLSX.utils.book_new();
      const exportData = rows.length > 0 ? rows : [{ Status: 'No attendance records matching the selected filter criteria.' }];
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      if (exportFormat === 'csv') {
        const csvContent = XLSX.utils.sheet_to_csv(ws);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csvContent);
      } else {
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
        return res.send(buf);
      }
    } catch (err: any) {
      console.error('Export attendance error:', err);
      res.status(500).json({ error: err.message || 'Failed to export attendance report.' });
    }
  });

  // Excel Students Import Preview (dry-run validation without mutating)
  app.get("/api/academic/import-preview", (req, res) => {
    try {
      const { validation, students } = buildUnifiedStudentsDirectory();
      res.json({
        validation,
        sampleStudents: students.slice(0, 15)
      });
    } catch (err: any) {
      console.error('Import preview error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate Excel import preview.' });
    }
  });

  // Excel Students Import Confirmation (writes to database and saves state)
  app.post("/api/academic/import-confirm", (req, res) => {
    try {
      const validation = db.reimportStudentsFromExcel();
      res.json({
        success: true,
        message: `Successfully integrated ${db.students.length} students into BCA Department across 6 semesters.`,
        validation,
        totalStudents: db.students.length
      });
    } catch (err: any) {
      console.error('Import confirm error:', err);
      res.status(500).json({ error: err.message || 'Failed to complete student import from Excel.' });
    }
  });

  // Latest Excel Import Summary
  app.get("/api/academic/import-summary", (req, res) => {
    res.json(db.importValidationSummary || { status: 'NO_IMPORT_RECORDED' });
  });

  // 8. Campus Maintenance Module
  app.get("/api/maintenance", (req, res) => {
    res.json(db.maintenance);
  });

  app.post("/api/maintenance", async (req, res) => {
    const { title, description, location, reported_by_name, reported_by_role, reported_by_email } = req.body;
    
    // AI Classification
    const aiClassification = await classifyCampusIssue(title, description, location);
    const assignedStaff = db.staff.find(s => s.name.toLowerCase().includes(aiClassification.assignedTo.split(' ')[0].toLowerCase())) || db.staff[2];

    const newIssue = {
      id: `mnt-${Date.now()}`,
      reported_by_name: reported_by_name || 'Sarah Jenkins',
      reported_by_role: reported_by_role || 'TEACHER',
      reported_by_email: reported_by_email || 's.jenkins@devora.edu',
      title,
      description,
      location: location || 'Campus Main Wing',
      category: (aiClassification.category as any) || 'Classroom Equipment',
      priority: aiClassification.priority,
      status: 'PENDING' as const,
      assigned_to_name: aiClassification.assignedTo,
      assigned_to_id: assignedStaff?.id || 'usr-mnt-03',
      assigned_to_email: assignedStaff?.email || 'rajesh.k@devora.edu',
      created_at: new Date().toISOString(),
      email_sent: false,
      sms_sent: false
    };

    // In-app Notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Campus Issue Reported',
      message: `${newIssue.reported_by_name} reported: ${newIssue.title} (Assigned to ${newIssue.assigned_to_name}).`,
      type: newIssue.priority === 'HIGH' || newIssue.priority === 'URGENT' ? 'URGENT' : 'WARNING',
      related_type: 'MAINTENANCE',
      related_id: newIssue.id,
      read: false,
      created_at: new Date().toISOString()
    });

    // SMTP Email Trigger if preference enabled
    const emailEnabled = db.preferences.email_maintenance_urgent ?? db.preferences.sms_maintenance_urgent ?? true;
    if (emailEnabled) {
      const emailResult = await dispatchEmail(
        newIssue.assigned_to_email,
        `DEVORA ALERT: New ${newIssue.priority} Priority Issue Assigned: ${newIssue.title}`,
        `A new maintenance issue has been assigned to you:\n\nTitle: ${newIssue.title}\nPriority: ${newIssue.priority}\nLocation: ${newIssue.location}\nDescription: ${newIssue.description}\nReported By: ${newIssue.reported_by_name}`,
        {
          recipientName: newIssue.assigned_to_name,
          triggerEvent: 'Maintenance Assignment'
        }
      );
      newIssue.email_sent = true;
      newIssue.sms_sent = true;

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: newIssue.assigned_to_email,
        recipient_name: newIssue.assigned_to_name,
        subject: `DEVORA ALERT: New ${newIssue.priority} Priority Issue: ${newIssue.title}`,
        message: `ALERT: New ${newIssue.priority} issue assigned: ${newIssue.title} (${newIssue.location}).`,
        template_id: 'DEVORA_MNT_ALERT',
        status: emailResult.status,
        trigger_event: 'Maintenance Assignment',
        created_at: new Date().toISOString(),
        recipient_phone: assignedStaff?.phone
      });
    }

    db.maintenance.unshift(newIssue);
    res.status(201).json({ issue: newIssue, aiClassification });
  });

  app.patch("/api/maintenance/:id", async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const issue = db.maintenance.find(m => m.id === id);

    if (!issue) {
      return res.status(404).json({ error: "Maintenance issue not found" });
    }

    issue.status = status || issue.status;
    if (notes) issue.notes = notes;
    if (status === 'RESOLVED') {
      issue.resolved_at = new Date().toISOString();

      // Trigger notification & email when resolved
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Issue Resolved',
        message: `Maintenance item "${issue.title}" has been marked RESOLVED by Facilities.`,
        type: 'SUCCESS',
        related_type: 'MAINTENANCE',
        related_id: issue.id,
        read: false,
        created_at: new Date().toISOString()
      });

      const emailEnabled = db.preferences.email_request_resolved ?? db.preferences.sms_request_resolved ?? true;
      if (emailEnabled) {
        const reporterEmail = issue.reported_by_email || 's.jenkins@devora.edu';
        const emailRes = await dispatchEmail(
          reporterEmail,
          `DEVORA RESOLUTION: "${issue.title}" has been resolved`,
          `The campus maintenance request "${issue.title}" reported by you at ${issue.location} has been marked as RESOLVED by Campus Facilities.\n\nNotes: ${notes || 'Issue addressed.'}`,
          {
            recipientName: issue.reported_by_name,
            triggerEvent: 'Maintenance Resolved'
          }
        );

        db.emailLogs.unshift({
          id: `email-${Date.now()}`,
          recipient_email: reporterEmail,
          recipient_name: issue.reported_by_name,
          subject: `DEVORA RESOLUTION: "${issue.title}" has been resolved`,
          message: `DEVORA UPDATE: "${issue.title}" has been RESOLVED by Campus Maintenance.`,
          template_id: 'DEVORA_RESOLVED',
          status: emailRes.status,
          trigger_event: 'Maintenance Resolved',
          created_at: new Date().toISOString(),
          recipient_phone: '+15550192832'
        });
      }
    }

    res.json(issue);
  });

  // 9. Smart Requests Module
  app.get("/api/requests", (req, res) => {
    res.json(db.requests);
  });

  app.post("/api/requests", async (req, res) => {
    const { title, description, request_type, requester_name, requester_role } = req.body;
    const classification = await classifyCampusIssue(title, description);

    const newReq = {
      id: `req-${Date.now()}`,
      requester_id: 'usr-gen',
      requester_name: requester_name || 'Aiden Sharma',
      requester_role: requester_role || 'STUDENT',
      request_type: request_type || 'General request',
      title,
      description,
      location: req.body.location || 'Administration',
      ai_category: (classification.category as any) || 'Administrative',
      ai_priority: classification.priority,
      assigned_department: classification.department,
      assigned_to: classification.assignedTo,
      status: 'IN_PROGRESS' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.requests.unshift(newReq);

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Service Request',
      message: `${newReq.requester_name} submitted: "${newReq.title}". Triaged to ${newReq.assigned_department}.`,
      type: 'INFO',
      related_type: 'REQUEST',
      related_id: newReq.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newReq);
  });

  app.patch("/api/requests/:id", (req, res) => {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    const reqItem = db.requests.find(r => r.id === id);
    if (!reqItem) return res.status(404).json({ error: "Request not found" });

    if (status) reqItem.status = status;
    if (resolution_notes) reqItem.resolution_notes = resolution_notes;
    reqItem.updated_at = new Date().toISOString();

    res.json(reqItem);
  });

  // 10. Leave Management
  app.get("/api/leave", (req, res) => {
    res.json(db.leaveRequests);
  });

  app.post("/api/leave", (req, res) => {
    const { applicant_name, applicant_role, applicant_phone, applicant_email, leave_type, start_date, end_date, days_count, reason } = req.body;
    const newLeave = {
      id: `lev-${Date.now()}`,
      applicant_id: 'usr-app',
      applicant_name: applicant_name || 'Sarah Jenkins',
      applicant_role: applicant_role || 'TEACHER',
      applicant_phone: applicant_phone || '+15550192832',
      applicant_email: applicant_email || (applicant_name === 'Sarah Jenkins' ? 's.jenkins@devora.edu' : 'applicant@devora.edu'),
      leave_type: leave_type || 'Medical',
      start_date,
      end_date,
      days_count: Number(days_count) || 1,
      reason,
      status: 'PENDING' as const,
      email_dispatched: false,
      sms_dispatched: false,
      created_at: new Date().toISOString()
    };
    db.leaveRequests.unshift(newLeave);

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Leave Application Submitted',
      message: `${newLeave.applicant_name} applied for ${newLeave.days_count}-day ${newLeave.leave_type} leave.`,
      type: 'INFO',
      related_type: 'LEAVE',
      related_id: newLeave.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newLeave);
  });

  app.patch("/api/leave/:id", async (req, res) => {
    const { id } = req.params;
    const { status, reviewer_notes } = req.body;
    const leave = db.leaveRequests.find(l => l.id === id);
    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    leave.status = status;
    if (reviewer_notes) leave.reviewer_notes = reviewer_notes;

    // Trigger SMTP Email on Leave Approval or Rejection
    const emailEnabled = db.preferences.email_leave_updates ?? db.preferences.sms_leave_updates ?? true;
    const targetEmail = leave.applicant_email || (leave.applicant_name === 'Sarah Jenkins' ? 's.jenkins@devora.edu' : 'applicant@devora.edu');

    if (emailEnabled && targetEmail) {
      const msg = status === 'APPROVED'
        ? `Your ${leave.leave_type} leave request (${leave.start_date} to ${leave.end_date}) for ${leave.days_count} day(s) has been APPROVED by the Administration.`
        : `Your ${leave.leave_type} leave request was not approved. Reviewer Notes: ${reviewer_notes || 'Please contact Administration.'}`;

      const emailRes = await dispatchEmail(
        targetEmail,
        `Devora School: Leave Request ${status} — ${leave.applicant_name}`,
        msg,
        {
          recipientName: leave.applicant_name,
          triggerEvent: `Leave ${status}`
        }
      );
      leave.email_dispatched = true;
      leave.sms_dispatched = true;

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: targetEmail,
        recipient_name: leave.applicant_name,
        subject: `Devora School: Leave Request ${status}`,
        message: msg,
        template_id: status === 'APPROVED' ? 'DEVORA_LEAVE_APPROVED' : 'DEVORA_LEAVE_REJECTED',
        status: emailRes.status,
        trigger_event: `Leave ${status}`,
        created_at: new Date().toISOString(),
        recipient_phone: leave.applicant_phone
      });
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Leave ${status}`,
      message: `Leave request for ${leave.applicant_name} was marked ${status}.`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      related_type: 'LEAVE',
      related_id: leave.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.json(leave);
  });

  // 11. Notifications
  app.get("/api/notifications", (req, res) => {
    res.json(db.notifications);
  });

  app.patch("/api/notifications/:id/read", (req, res) => {
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", (req, res) => {
    db.notifications.forEach(n => n.read = true);
    res.json({ success: true });
  });

  app.post("/api/notifications/clear-all", (req, res) => {
    db.notifications = [];
    res.json({ success: true });
  });

  // ==========================================
  // AUTHENTICATION & FACULTY CREDENTIALS
  // ==========================================

  // List faculty for login helper / self-service
  app.get("/api/auth/faculty", (req, res) => {
    const list = db.staff.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role_title: s.role_title,
      department: s.department,
      has_password: Boolean(s.password)
    }));
    res.json(list);
  });

  // Universal Login (Admin, Faculty by email, Student)
  app.post("/api/auth/login", (req, res) => {
    const { username, email, password, role } = req.body;
    const identifier = (email || username || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    if (!identifier) {
      return res.status(400).json({ error: "Email or username is required." });
    }

    // 1. Admin login
    if (role === 'ADMIN' || identifier === 'admin@devora.edu' || identifier === 'director@devora.edu') {
      if ((identifier === 'admin@devora.edu' || identifier === 'director@devora.edu') && pwd === 'admin123') {
        return res.json({
          success: true,
          role: 'ADMIN',
          name: 'Dr. Alistair Vance',
          email: 'director@devora.edu'
        });
      }
      const adminStaff = db.staff.find(s => s.email.toLowerCase() === identifier && s.role_title.toLowerCase() === 'administration');
      if (adminStaff) {
        if (!adminStaff.password) {
          return res.status(403).json({
            needsPasswordCreation: true,
            email: adminStaff.email,
            name: adminStaff.name,
            error: "No password has been set for this account yet. Please create your password."
          });
        }
        if (adminStaff.password === pwd) {
          return res.json({
            success: true,
            role: 'ADMIN',
            name: adminStaff.name,
            email: adminStaff.email
          });
        }
      }
      if (role === 'ADMIN') {
        return res.status(401).json({ error: "Invalid admin credentials." });
      }
    }

    // 2. Teacher / Faculty login by their own email
    if (role === 'TEACHER' || role === 'STAFF' || !role) {
      // Legacy demo teacher
      if (identifier === 'teacher@devora.edu' && pwd === 'teacher123') {
        return res.json({
          success: true,
          role: 'TEACHER',
          name: 'Sarah Jenkins',
          email: 's.jenkins@devora.edu'
        });
      }

      const faculty = db.staff.find(s => s.email.toLowerCase() === identifier);
      if (faculty) {
        if (!faculty.password) {
          return res.status(403).json({
            needsPasswordCreation: true,
            email: faculty.email,
            name: faculty.name,
            error: "Welcome! You haven't created a password for your faculty account yet. Please create your password now."
          });
        }
        if (faculty.password === pwd) {
          return res.json({
            success: true,
            role: 'TEACHER',
            name: faculty.name,
            email: faculty.email,
            faculty_id: faculty.id,
            employee_id: faculty.employee_id
          });
        }
        return res.status(401).json({ error: "Invalid password for faculty account " + faculty.email });
      }
    }

    // 3. Student login
    if (role === 'STUDENT' || identifier === 'student@devora.edu') {
      if (identifier === 'student@devora.edu' && pwd === 'student123') {
        return res.json({
          success: true,
          role: 'STUDENT',
          name: 'Aiden Sharma',
          email: 'student@devora.edu'
        });
      }
      const student = db.students.find(s => (s.email && s.email.toLowerCase() === identifier) || s.roll_number.toLowerCase() === identifier);
      if (student) {
        const studentValidPass = student.password || 'student123';
        if (pwd === studentValidPass) {
          return res.json({
            success: true,
            role: 'STUDENT',
            name: student.name,
            email: student.email || identifier
          });
        }
      }
    }

    return res.status(401).json({ error: "Invalid email or password. Please verify your credentials." });
  });

  // Faculty Create / Set Password
  app.post("/api/auth/create-password", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    const faculty = db.staff.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
    if (!faculty) {
      return res.status(404).json({ error: `Faculty account with email "${email}" was not found. Please contact campus admin.` });
    }

    faculty.password = password.trim();

    try {
      await dispatchEmail(
        faculty.email,
        "Devora Campus — Your Faculty Password Has Been Set",
        `Hello ${faculty.name},\n\nYour password for the Devora Campus Operations Portal has been successfully set. You can now log in using ${faculty.email} and your new password.\n\nDevora AI Campus System`,
        { recipientName: faculty.name, triggerEvent: "Password Creation" }
      );
    } catch (e: any) {
      console.warn("[AUTH] Email notification skipped:", e.message);
    }

    res.json({
      success: true,
      name: faculty.name,
      email: faculty.email,
      role: 'TEACHER',
      message: "Password created successfully! You can now log in."
    });
  });

  // Forgot Password: Send Reset Link & Code to registered email
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Please enter your registered email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const faculty = db.staff.find(s => s.email.toLowerCase() === cleanEmail);
    const student = db.students.find(s => (s.email && s.email.toLowerCase() === cleanEmail) || s.roll_number.toLowerCase() === cleanEmail);
    const isAdmin = cleanEmail === 'admin@devora.edu' || cleanEmail === 'director@devora.edu';
    const isStudent = cleanEmail === 'student@devora.edu' || Boolean(student);

    if (!faculty && !isAdmin && !isStudent) {
      return res.status(404).json({ error: `No campus account found with email "${email}". Please verify your registered email.` });
    }

    // Students are not permitted to reset passwords self-service
    if (isStudent && !faculty && !isAdmin) {
      return res.status(403).json({
        error: "Students cannot reset passwords self-service. Only the campus administrator has permission to change a student password."
      });
    }

    const targetEmail = faculty ? faculty.email : student?.email || cleanEmail;
    const recipientName = faculty?.name || student?.name || (isAdmin ? 'Dr. Alistair Vance' : 'Campus Member');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    db.resetTokens[cleanEmail] = code;
    if (targetEmail.toLowerCase() !== cleanEmail) {
      db.resetTokens[targetEmail.toLowerCase()] = code;
    }

    const host = req.headers.host || 'localhost:3001';
    const protocol = req.protocol || 'http';
    const origin = req.headers.origin || `${protocol}://${host}`;
    const resetUrl = `${origin}/?resetToken=${code}&email=${encodeURIComponent(targetEmail)}`;

    const resetHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FFF8EC; border: 1px solid #E8DDCA; border-radius: 16px; overflow: hidden; color: #2B2020;">
        <div style="background-color: #6B1E2B; padding: 24px 28px; text-align: left;">
          <h1 style="color: #FFF8EC; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">DEVORA AI</h1>
          <p style="color: rgba(255,248,236,0.8); margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Campus Identity &amp; Password Recovery</p>
        </div>
        <div style="padding: 28px;">
          <h2 style="color: #2B2020; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">Password Reset Request</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A3A3A; margin: 0 0 16px 0;">
            Hello <strong>${recipientName}</strong>,<br><br>
            We received a request to reset the password for your Devora Campus account registered with <strong>${targetEmail}</strong>.
          </p>
          
          <div style="background-color: #FFFFFF; border: 1px solid rgba(107,30,43,0.15); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #756565; margin: 0 0 8px 0;">Your 6-Digit Verification Code</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6B1E2B; font-family: monospace; padding: 6px 0;">
              ${code}
            </div>
            <p style="font-size: 11px; color: #9A8989; margin: 8px 0 0 0;">Enter this code on the login page to reset your password.</p>
          </div>

          <div style="text-align: center; margin: 24px 0 20px 0;">
            <a href="${resetUrl}" style="background-color: #6B1E2B; color: #FFFFFF; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(107,30,43,0.2);">
              Click Here to Reset Password
            </a>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #756565; margin: 20px 0 0 0; border-top: 1px solid #E8DDCA; padding-top: 16px;">
            If you did not request a password reset, please ignore this email. Your account credentials remain completely secure.
          </p>
        </div>
      </div>
    `;

    try {
      const emailRes = await dispatchEmail(
        targetEmail,
        "Devora Campus — Password Reset Instructions & Code",
        `Hello ${recipientName},\n\nYour 6-digit verification code to reset your Devora Campus account password is: ${code}\n\nYou can also reset your password directly using this link:\n${resetUrl}\n\nDevora AI Campus System`,
        {
          recipientName,
          triggerEvent: "Password Reset",
          htmlContent: resetHtml
        }
      );

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: targetEmail,
        recipient_name: recipientName,
        subject: "Devora Campus — Password Reset Instructions & Code",
        message: `Password reset verification code dispatched to ${targetEmail}. Code: ${code}`,
        template_id: 'DEVORA_PASSWORD_RESET',
        status: emailRes.status,
        trigger_event: 'Password Reset',
        created_at: new Date().toISOString()
      });
    } catch (e: any) {
      console.warn("[AUTH] SMTP dispatch error:", e.message);
    }

    res.json({
      success: true,
      message: `A password reset email has been sent to ${targetEmail}. Please check your inbox.`,
      target_email: targetEmail
    });
  });

  // Reset Password with Code
  app.post("/api/auth/reset-password", (req, res) => {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: "Email, reset code, and new password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const validCode = db.resetTokens[cleanEmail];

    if (!validCode || validCode !== code.trim()) {
      return res.status(400).json({ error: "Invalid or expired reset code. Please request a new one." });
    }

    const faculty = db.staff.find(s => s.email.toLowerCase() === cleanEmail);
    if (faculty) {
      faculty.password = new_password.trim();
    }
    const student = db.students.find(s => s.email && s.email.toLowerCase() === cleanEmail);
    if (student) {
      student.password = new_password.trim();
    }

    delete db.resetTokens[cleanEmail];

    res.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password."
    });
  });

  // 12. Email / SMTP Logs & Direct Test Dispatch
  app.get("/api/email/logs", (req, res) => {
    res.json(db.emailLogs);
  });

  // Backwards compatibility endpoint
  app.get("/api/sms/logs", (req, res) => {
    res.json(db.emailLogs);
  });

  app.get("/api/email/smtp-status", async (req, res) => {
    const status = await verifySMTPConnection();
    res.json(status);
  });

  app.post("/api/email/send", async (req, res) => {
    const { recipient_email, recipient_name, subject, message, trigger_event } = req.body;
    const email = recipient_email || req.body.phone_number || req.body.to;
    if (!email || !message) {
      return res.status(400).json({ error: "recipient_email and message required" });
    }

    const finalSubject = subject || `Devora Campus Notification: ${trigger_event || 'General'}`;
    const result = await dispatchEmail(
      email,
      finalSubject,
      message,
      {
        recipientName: recipient_name || 'Campus Member',
        triggerEvent: trigger_event || 'Manual Admin Email'
      }
    );

    db.emailLogs.unshift({
      id: `email-${Date.now()}`,
      recipient_email: email,
      recipient_name: recipient_name || 'Campus Member',
      subject: finalSubject,
      message,
      template_id: 'DEVORA_MANUAL',
      status: result.status,
      trigger_event: trigger_event || 'Manual Admin Email',
      created_at: new Date().toISOString(),
      recipient_phone: req.body.phone_number
    });

    if (result.status === 'FAILED') {
      return res.status(502).json({
        ...result,
        error: result.response_details?.error || 'Email dispatch failed'
      });
    }

    res.json(result);
  });

  // Backwards compatibility endpoint for direct SMS sends -> now handled by email gateway
  app.post("/api/sms/send", async (req, res) => {
    const { phone_number, message, trigger_event, recipient_name } = req.body;
    const targetEmail = req.body.recipient_email || 'admin@devora-campus.edu';
    
    const result = await dispatchEmail(
      targetEmail,
      `DEVORA ALERT: ${trigger_event || 'Admin Notification'}`,
      message,
      {
        recipientName: recipient_name || 'Recipient',
        triggerEvent: trigger_event || 'Manual Admin Trigger'
      }
    );

    db.emailLogs.unshift({
      id: `email-${Date.now()}`,
      recipient_email: targetEmail,
      recipient_name: recipient_name || 'Recipient',
      subject: `DEVORA ALERT: ${trigger_event || 'Admin Notification'}`,
      message,
      template_id: 'DEVORA_MANUAL',
      status: result.status,
      trigger_event: trigger_event || 'Manual Admin Trigger',
      created_at: new Date().toISOString(),
      recipient_phone: phone_number
    });

    res.json(result);
  });

  // 13. Notification Preferences
  app.get("/api/preferences", (req, res) => {
    res.json(db.preferences);
  });

  app.patch("/api/preferences", (req, res) => {
    db.preferences = { ...db.preferences, ...req.body };
    res.json(db.preferences);
  });

  // 14. Announcements & Notices
  app.get("/api/announcements", (req, res) => {
    res.json(db.announcements);
  });

  app.post("/api/announcements", async (req, res) => {
    const { title, content, target_audience, priority, author_name, email_broadcast, sms_broadcast } = req.body;
    const shouldBroadcast = email_broadcast !== undefined ? !!email_broadcast : !!sms_broadcast;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      content,
      target_audience: target_audience || 'ALL',
      priority: priority || 'NORMAL',
      author_name: author_name || 'Dr. Alistair Vance',
      created_at: new Date().toISOString(),
      email_broadcast: shouldBroadcast,
      sms_broadcast: shouldBroadcast
    };

    db.announcements.unshift(newAnn);

    // If email broadcast is checked, record email dispatch
    const broadcastPref = db.preferences.email_emergency_alerts ?? db.preferences.sms_emergency_alerts ?? true;
    if (shouldBroadcast && broadcastPref) {
      const emailRes = await dispatchEmail(
        'broadcast-all@devora-campus.edu',
        `DEVORA BROADCAST: ${title}`,
        `Campus Announcement for ${target_audience}:\n\n${content}`,
        {
          recipientName: `All Campus ${target_audience}`,
          triggerEvent: 'Broadcast Notice'
        }
      );

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: 'broadcast-all@devora-campus.edu',
        recipient_name: `All ${target_audience}`,
        subject: `DEVORA BROADCAST: ${title}`,
        message: `BROADCAST: ${title} — ${content.slice(0, 100)}...`,
        template_id: 'DEVORA_ANNOUNCEMENT',
        status: emailRes.status,
        trigger_event: 'Broadcast Notice',
        created_at: new Date().toISOString()
      });
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Notice: ${title}`,
      message: content.slice(0, 80) + '...',
      type: priority === 'URGENT' ? 'URGENT' : 'INFO',
      related_type: 'ANNOUNCEMENT',
      related_id: newAnn.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newAnn);
  });

  // 15. Timetable
  app.get("/api/timetable", (req, res) => {
    const { class_grade, section } = req.query;
    let list = db.timetable;
    if (class_grade) list = list.filter(t => t.class_grade === String(class_grade));
    if (section) list = list.filter(t => t.section === String(section));
    res.json(list);
  });

  // 16. Demo Story Runner / Reset
  app.post("/api/demo/reset", (req, res) => {
    db.seedDatabase();
    res.json({ success: true, message: "Database reseeded to clean demo state." });
  });

  // ==========================================
  // Vite Middleware & Static Serving
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DEVORA AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
