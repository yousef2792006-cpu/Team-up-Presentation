export interface CheckpointMeta {
  id: number;
  code: string;
  levelLabel: string;
  title: string;
  subtitle: string;
  cactusVariant: 'single' | 'double' | 'triple' | 'gate';
  summaryPoints: string[];
}

export interface ErdEntityNode {
  id: string;
  name: string;
  category: 'Academic & Profile' | 'Projects & Tasks' | 'Activities & Events' | 'Gamification & Alerts';
  pk: string;
  fks: string[];
  attributes: string[];
  description: string;
  junctionTables?: string[];
  relationships: {
    target: string;
    cardinality: '1:1' | '1:N' | 'M:N';
    via?: string;
    label: string;
  }[];
}

export interface ApiEndpointSpec {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  controller: string;
  route: string;
  authRole: string;
  summary: string;
  requestBody?: string;
  responseStatus: number;
  responseBody: string;
}

export interface StatusCodeSpec {
  code: number;
  name: string;
  category: 'Success' | 'Client Error' | 'Server Error';
  teamUpContext: string;
  sampleJson: string;
}

export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const CHECKPOINTS: CheckpointMeta[] = [
  {
    id: 1,
    code: 'LVL-01',
    levelLabel: 'LEVEL 1 – WHAT IS TEAMUP?',
    title: 'Welcome to TeamUp',
    subtitle: 'Build Your Skills. Find Your Team. Grow Together.',
    cactusVariant: 'single',
    summaryPoints: [
      'Collaboration & Skill-Building Network for University Students (Years 1–4).',
      'Replaces chaotic WhatsApp/Facebook team hunting with verified skill portfolios.',
      '5 Core Business Modules: Team Formation, Profiles & Scoring, Student Activities, Events & Workshops, Gamification.',
      '3 System Roles: Student, OrgAdmin, and PlatformAdmin.',
    ],
  },
  {
    id: 2,
    code: 'LVL-02',
    levelLabel: 'LEVEL 2 – UNDERSTANDING THE BACKEND',
    title: 'Behind the Scenes',
    subtitle: 'C# / ASP.NET Core (.NET 10) & OpenAPI 3.0 Architecture',
    cactusVariant: 'double',
    summaryPoints: [
      'Built on C# and ASP.NET Core (.NET 10) with Swagger / OpenAPI 3.0 documentation.',
      '6 RESTful Controllers: Events, Registrations, Attendance, Gamification, Badges, Notifications.',
      'Full Request Lifecycle: User Action → Frontend → REST API → Business Logic → TeamUpDB → JSON Response.',
    ],
  },
  {
    id: 3,
    code: 'LVL-03',
    levelLabel: 'LEVEL 3 – DATABASE & ERD',
    title: 'The Database Engine',
    subtitle: 'TeamUpDB Chen ERD – 13 Core Entities & Junction Relationships',
    cactusVariant: 'triple',
    summaryPoints: [
      'Designed using Chen ERD notation with 13 core entities across 4 domains.',
      'Covers 1:1 (Student ↔ StudentProfile), 1:N (University → Faculty → Student), and M:N via Junction Tables.',
      'Junction tables store relationship attributes like ProficiencyLevel, YearsOfExperience, and IsMandatory.',
    ],
  },
  {
    id: 4,
    code: 'LVL-04',
    levelLabel: 'LEVEL 4 – API & HTTP METHODS',
    title: 'The API Control Center',
    subtitle: 'RESTful Endpoints, JSON Contracts & HTTP Status Codes',
    cactusVariant: 'double',
    summaryPoints: [
      'Standard HTTP Verbs: GET (Retrieve), POST (Create), PUT (Replace/Update), PATCH (Partial Update), DELETE (Cancel/Remove).',
      'Versioned routes under /api/v1/* with structured JSON request/response bodies.',
      'Semantic status codes: 200, 201, 204, 400, 401, 403, 404, 409 Conflict, and 500.',
    ],
  },
  {
    id: 5,
    code: 'LVL-05',
    levelLabel: 'LEVEL 5 – EVENTS & WORKSHOPS',
    title: 'Event Management System',
    subtitle: 'EventsController (/api/v1/events) & Multi-Session Workshops',
    cactusVariant: 'triple',
    summaryPoints: [
      'Organizations (IEEE, GDG, Enactus, ACM) organize Events with strict Capacity limits.',
      'Each Event decomposes into 1:N EventSessions (e.g., Data Analysis Workshop: Sessions 1, 2, 3).',
      'Enforces OrgAdmin & PlatformAdmin role authorization for creating/updating events.',
    ],
  },
  {
    id: 6,
    code: 'LVL-06',
    levelLabel: 'LEVEL 6 – EVENT REGISTRATION',
    title: 'Registration System & Concurrency',
    subtitle: 'Anti-Overbooking Engine with Serializable Isolation & Row Locks',
    cactusVariant: 'double',
    summaryPoints: [
      'RegistrationsController (/api/v1/events/{id}/registrations) validates seat capacity and prevents duplicates.',
      'Solves the Last-Seat Race Condition (Capacity = 100, RegisteredCount = 99) when 2 students click simultaneously.',
      'Uses Database Transaction (IsolationLevel.Serializable) + SQL UPDLOCK, HOLDLOCK so 1st succeeds (201) and 2nd gets 409 Conflict.',
    ],
  },
  {
    id: 7,
    code: 'LVL-07',
    levelLabel: 'LEVEL 7 – SESSION ATTENDANCE',
    title: 'Attendance Tracking',
    subtitle: 'Multi-Method Verification: QRCode, RFID & Manual Check-In',
    cactusVariant: 'triple',
    summaryPoints: [
      'AttendanceController (/api/v1/sessions/{id}/attendance) records actual physical/live session presence.',
      'Supports 3 verification methods: QRCode, RFID, and Manual entry by OrgAdmin.',
      'Enforces UNIQUE (SessionID, StudentID) constraint to block duplicate check-ins and double point farming.',
    ],
  },
  {
    id: 8,
    code: 'LVL-08',
    levelLabel: 'LEVEL 8 – GAMIFICATION & SCORE LEDGER',
    title: 'The Gamification Engine',
    subtitle: 'Immutable ScoreTransaction Ledger & Non-Linear Level Formula',
    cactusVariant: 'double',
    summaryPoints: [
      'Immutable ScoreTransaction table acts like a financial ledger (Points, Reason, SourceType, CreatedAt).',
      'Dynamic Level Formula: CurrentLevel = FLOOR(SQRT(TotalPoints / 100)) + 1.',
      'Verified session attendance triggers a documented +100 pts transaction.',
    ],
  },
  {
    id: 9,
    code: 'LVL-09',
    levelLabel: 'LEVEL 9 – BADGES & ACHIEVEMENTS',
    title: 'Achievements Unlocked',
    subtitle: 'Automated Criteria Evaluation & StudentBadge Awarding',
    cactusVariant: 'single',
    summaryPoints: [
      'BadgesController (/api/v1/badges & /api/v1/students/{id}/badges) manages the university badge catalog.',
      'Evaluates CriteriaType & CriteriaValue automatically whenever a student earns points.',
      'Grants StudentBadge records automatically without manual intervention once thresholds are met.',
    ],
  },
  {
    id: 10,
    code: 'LVL-10',
    levelLabel: 'LEVEL 10 – NOTIFICATIONS',
    title: 'The Notification System',
    subtitle: 'Real-Time Inbox, Read States & Owner-Based Access Control',
    cactusVariant: 'double',
    summaryPoints: [
      'NotificationsController (/api/v1/notifications) manages student alerts and mark-all-read operations.',
      'Tracks IsRead state, notification Type, Title, Message, and CreatedAt timestamp.',
      'Enforces strict Owner-Based Access Control so students only access or delete their own notifications.',
    ],
  },
  {
    id: 11,
    code: 'LVL-11',
    levelLabel: 'CROSS-MODULE INTEGRATION',
    title: 'Connected Backend Pipeline',
    subtitle: 'How One Action Cascades Across All 6 Backend Modules & Frontend UI',
    cactusVariant: 'triple',
    summaryPoints: [
      'End-to-End Chain: Event Creation → Registration → Session Attendance → Score Transaction → Badge Unlock → Notification.',
      'Frontend Architecture: Morphing Sticky Header, Liquid Gliding Pill, Persistent Email Auth (+100 pts), Typewriter Search.',
      'Clearly separates Implemented Core vs. Next Phase Full-Stack Roadmap.',
    ],
  },
  {
    id: 12,
    code: 'LVL-12',
    levelLabel: 'SECURITY & AUTHENTICATION',
    title: 'Security Checkpoint',
    subtitle: 'JWT Bearer Tokens, RBAC Roles & Ownership Validation',
    cactusVariant: 'gate',
    summaryPoints: [
      'Authentication ("Who are you?") vs. Authorization ("What are you allowed to do?").',
      'Uses JWT Bearer Authentication ([Authorize]) and Role-Based Access Control (Student, OrgAdmin, PlatformAdmin).',
      'Combines password hashing, protected endpoints, and resource ownership checks.',
    ],
  },
];

export const ERD_ENTITIES: ErdEntityNode[] = [
  {
    id: 'University',
    name: 'University',
    category: 'Academic & Profile',
    pk: 'UniversityID',
    fks: [],
    attributes: ['UniversityID (PK)', 'Name', 'Domain', 'Location', 'CreatedAt'],
    description: 'Root academic institution entity that contains multiple faculties across campus.',
    relationships: [
      { target: 'Faculty', cardinality: '1:N', label: 'Contains (1:N)' },
    ],
  },
  {
    id: 'Faculty',
    name: 'Faculty',
    category: 'Academic & Profile',
    pk: 'FacultyID',
    fks: ['UniversityID (FK)'],
    attributes: ['FacultyID (PK)', 'UniversityID (FK)', 'Name', 'Code'],
    description: 'Academic faculty or college within a university where students are enrolled.',
    relationships: [
      { target: 'University', cardinality: '1:N', label: 'Belongs to (N:1)' },
      { target: 'Student', cardinality: '1:N', label: 'Enrolls (1:N)' },
    ],
  },
  {
    id: 'Student',
    name: 'Student',
    category: 'Academic & Profile',
    pk: 'StudentID',
    fks: ['FacultyID (FK)'],
    attributes: [
      'StudentID (PK)',
      'FacultyID (FK)',
      'FullName',
      'UniversityEmail',
      'PasswordHash',
      'AcademicYear (1–4)',
      'Role (Student/OrgAdmin/PlatformAdmin)',
      'TotalPoints',
      'CurrentLevel',
    ],
    description: 'Central user entity in TeamUpDB connecting skills, projects, activities, events, scores, and badges.',
    junctionTables: ['StudentSkill', 'ProjectApplication', 'ProjectMember', 'OrgJoinRequest', 'OrgMember', 'EventRegistration', 'SessionAttendance', 'StudentBadge'],
    relationships: [
      { target: 'StudentProfile', cardinality: '1:1', label: 'Has Profile (1:1)' },
      { target: 'Skill', cardinality: 'M:N', via: 'StudentSkill (ProficiencyLevel, YearsOfExperience)', label: 'HasSkill (M:N)' },
      { target: 'Project', cardinality: 'M:N', via: 'ProjectApplication / ProjectMember', label: 'Creates / AppliesTo / MemberOf' },
      { target: 'Event', cardinality: 'M:N', via: 'EventRegistration', label: 'Registers (M:N)' },
      { target: 'EventSession', cardinality: 'M:N', via: 'SessionAttendance', label: 'Attends (M:N)' },
      { target: 'ScoreTransaction', cardinality: '1:N', label: 'Earns (1:N)' },
      { target: 'Badge', cardinality: 'M:N', via: 'StudentBadge (AwardedAt)', label: 'EarnsBadge (M:N)' },
      { target: 'Notification', cardinality: '1:N', label: 'Receives (1:N)' },
    ],
  },
  {
    id: 'StudentProfile',
    name: 'StudentProfile',
    category: 'Academic & Profile',
    pk: 'ProfileID',
    fks: ['StudentID (FK, UNIQUE)'],
    attributes: ['ProfileID (PK)', 'StudentID (FK)', 'Bio', 'GitHubUrl', 'LinkedInUrl', 'PortfolioUrl', 'AvatarUrl'],
    description: 'One-to-One academic and professional portfolio extension for each Student.',
    relationships: [
      { target: 'Student', cardinality: '1:1', label: 'Belongs to Student (1:1)' },
    ],
  },
  {
    id: 'Skill',
    name: 'Skill',
    category: 'Academic & Profile',
    pk: 'SkillID',
    fks: [],
    attributes: ['SkillID (PK)', 'SkillName', 'Category (Frontend/Backend/AI/Design)', 'Description'],
    description: 'Standardized skill catalog linking students to project skill requirements.',
    junctionTables: ['StudentSkill (ProficiencyLevel, YearsOfExperience)', 'ProjectRequiredSkill (IsMandatory, MinProficiency)'],
    relationships: [
      { target: 'Student', cardinality: 'M:N', via: 'StudentSkill', label: 'Student possesses (M:N)' },
      { target: 'Project', cardinality: 'M:N', via: 'ProjectRequiredSkill', label: 'Required by Project (M:N)' },
    ],
  },
  {
    id: 'Project',
    name: 'Project',
    category: 'Projects & Tasks',
    pk: 'ProjectID',
    fks: ['CreatorStudentID (FK)'],
    attributes: ['ProjectID (PK)', 'CreatorStudentID (FK)', 'Title', 'Description', 'MaxTeamSize', 'Category', 'Status', 'CreatedAt'],
    description: 'Student-created academic, hackathon, or graduation project seeking teammates with complementary skills.',
    junctionTables: ['ProjectRequiredSkill', 'ProjectApplication', 'ProjectMember'],
    relationships: [
      { target: 'Student', cardinality: 'M:N', via: 'ProjectApplication & ProjectMember', label: 'Applicants & Team Members' },
      { target: 'Skill', cardinality: 'M:N', via: 'ProjectRequiredSkill (IsMandatory)', label: 'Requires Skills (M:N)' },
      { target: 'Task', cardinality: '1:N', label: 'Has Tasks (1:N)' },
    ],
  },
  {
    id: 'Task',
    name: 'Task',
    category: 'Projects & Tasks',
    pk: 'TaskID',
    fks: ['ProjectID (FK)', 'AssignedToStudentID (FK)'],
    attributes: ['TaskID (PK)', 'ProjectID (FK)', 'AssignedToStudentID (FK)', 'Title', 'Status (Todo/InProgress/Done)', 'Priority', 'DueDate'],
    description: 'Actionable work item on the Project Tasks Board assigned to a project member.',
    relationships: [
      { target: 'Project', cardinality: '1:N', label: 'Part of Project (N:1)' },
      { target: 'Student', cardinality: '1:N', label: 'Assigned to Student (N:1)' },
    ],
  },
  {
    id: 'Organization',
    name: 'Organization',
    category: 'Activities & Events',
    pk: 'OrganizationID',
    fks: ['UniversityID (FK)'],
    attributes: ['OrganizationID (PK)', 'Name (IEEE, GDG, Enactus, ACM)', 'Description', 'Category', 'RecruitmentOpen', 'LogoUrl'],
    description: 'Campus student activity or club managed by an OrgAdmin that recruits members and hosts events.',
    junctionTables: ['OrgJoinRequest', 'OrgMember'],
    relationships: [
      { target: 'Student', cardinality: 'M:N', via: 'OrgJoinRequest / OrgMember', label: 'Recruits & Members (M:N)' },
      { target: 'Event', cardinality: '1:N', label: 'Organizes Events (1:N)' },
    ],
  },
  {
    id: 'Event',
    name: 'Event',
    category: 'Activities & Events',
    pk: 'EventID',
    fks: ['OrganizationID (FK)'],
    attributes: ['EventID (PK)', 'OrganizationID (FK)', 'Title', 'Description', 'EventType (Workshop/Competition)', 'Capacity', 'RegisteredCount', 'StartDate', 'EndDate', 'Status'],
    description: 'Workshop, seminar, or competition with strict seat Capacity and multiple EventSessions.',
    junctionTables: ['EventRegistration (RegistrationStatus, RegisteredAt)'],
    relationships: [
      { target: 'Organization', cardinality: '1:N', label: 'Organized by (N:1)' },
      { target: 'EventSession', cardinality: '1:N', label: 'Has Sessions (1:N)' },
      { target: 'Student', cardinality: 'M:N', via: 'EventRegistration', label: 'Registered Students (M:N)' },
    ],
  },
  {
    id: 'EventSession',
    name: 'EventSession',
    category: 'Activities & Events',
    pk: 'SessionID',
    fks: ['EventID (FK)'],
    attributes: ['SessionID (PK)', 'EventID (FK)', 'Title', 'SessionDate', 'StartTime', 'EndTime', 'LocationOrRoom'],
    description: 'Individual scheduled session belonging to an Event where student attendance is verified.',
    junctionTables: ['SessionAttendance (VerificationMethod: QRCode/RFID/Manual, CheckedInAt)'],
    relationships: [
      { target: 'Event', cardinality: '1:N', label: 'Belongs to Event (N:1)' },
      { target: 'Student', cardinality: 'M:N', via: 'SessionAttendance', label: 'Attended by Students (M:N)' },
    ],
  },
  {
    id: 'ScoreTransaction',
    name: 'ScoreTransaction',
    category: 'Gamification & Alerts',
    pk: 'TransactionID',
    fks: ['StudentID (FK)'],
    attributes: ['TransactionID (PK)', 'StudentID (FK)', 'Points (+100)', 'Reason', 'SourceType (Attendance/Task/Project)', 'CreatedAt'],
    description: 'Immutable financial-style score ledger recording every point transaction earned by a student.',
    relationships: [
      { target: 'Student', cardinality: '1:N', label: 'Credited to Student (N:1)' },
    ],
  },
  {
    id: 'Badge',
    name: 'Badge',
    category: 'Gamification & Alerts',
    pk: 'BadgeID',
    fks: [],
    attributes: ['BadgeID (PK)', 'Name', 'Description', 'IconName', 'CriteriaType (TotalPoints/AttendanceCount)', 'CriteriaValue'],
    description: 'Achievement definition in the platform catalog automatically awarded when CriteriaValue is reached.',
    junctionTables: ['StudentBadge (StudentID, BadgeID, AwardedAt)'],
    relationships: [
      { target: 'Student', cardinality: 'M:N', via: 'StudentBadge', label: 'Awarded to Students (M:N)' },
    ],
  },
  {
    id: 'Notification',
    name: 'Notification',
    category: 'Gamification & Alerts',
    pk: 'NotificationID',
    fks: ['StudentID (FK)'],
    attributes: ['NotificationID (PK)', 'StudentID (FK)', 'Title', 'Message', 'Type', 'IsRead (bool)', 'CreatedAt'],
    description: 'Personal notification inbox item delivered to a student upon registration, points, or badge unlock.',
    relationships: [
      { target: 'Student', cardinality: '1:N', label: 'Delivered to Student (N:1)' },
    ],
  },
];

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: 'get-events',
    method: 'GET',
    controller: 'EventsController',
    route: '/api/v1/events',
    authRole: 'Public / Student',
    summary: 'Retrieve paginated list of university workshops, events, capacities, and sessions.',
    responseStatus: 200,
    responseBody: `{
  "data": [
    {
      "eventId": 42,
      "organization": "IEEE Campus Branch",
      "title": "Data Analysis Workshop",
      "capacity": 100,
      "registeredCount": 99,
      "sessionsCount": 3,
      "status": "Open"
    }
  ]
}`,
  },
  {
    id: 'post-event',
    method: 'POST',
    controller: 'EventsController',
    route: '/api/v1/events',
    authRole: 'OrgAdmin / PlatformAdmin',
    summary: 'Create a new workshop or event with capacity limits and multi-session schedule.',
    requestBody: `{
  "organizationId": 4,
  "title": "Data Analysis Workshop",
  "capacity": 100,
  "sessions": [
    { "title": "Session 1: Python & Pandas", "room": "Hall B2" },
    { "title": "Session 2: Exploratory Visuals", "room": "Lab 4" }
  ]
}`,
    responseStatus: 201,
    responseBody: `{
  "eventId": 42,
  "message": "Event and 2 EventSessions created successfully."
}`,
  },
  {
    id: 'post-registration',
    method: 'POST',
    controller: 'RegistrationsController',
    route: '/api/v1/events/42/registrations',
    authRole: 'Student (JWT Bearer)',
    summary: 'Register authenticated student in event #42 using Serializable transaction + UPDLOCK, HOLDLOCK.',
    requestBody: `{
  "studentId": 1084
}`,
    responseStatus: 201,
    responseBody: `{
  "registrationId": 9012,
  "eventId": 42,
  "studentId": 1084,
  "status": "Confirmed",
  "remainingSeats": 0
}`,
  },
  {
    id: 'delete-registration',
    method: 'DELETE',
    controller: 'RegistrationsController',
    route: '/api/v1/events/42/registrations/9012',
    authRole: 'Student (Owner)',
    summary: 'Cancel an existing registration and release the seat back to Event capacity.',
    responseStatus: 204,
    responseBody: `// 204 No Content - Registration cancelled & RegisteredCount decremented`,
  },
  {
    id: 'post-attendance',
    method: 'POST',
    controller: 'AttendanceController',
    route: '/api/v1/sessions/105/attendance',
    authRole: 'OrgAdmin / PlatformAdmin',
    summary: 'Verify session attendance via QRCode, RFID, or Manual check-in & trigger +100 pts.',
    requestBody: `{
  "studentId": 1084,
  "verificationMethod": "QRCode",
  "qrToken": "TUP-SES105-8821"
}`,
    responseStatus: 201,
    responseBody: `{
  "attendanceId": 551,
  "sessionId": 105,
  "studentId": 1084,
  "verificationMethod": "QRCode",
  "scoreTransaction": {
    "pointsAwarded": 100,
    "reason": "Session Attendance Verified",
    "newLevel": 3
  }
}`,
  },
  {
    id: 'get-score',
    method: 'GET',
    controller: 'GamificationController',
    route: '/api/v1/students/1084/score',
    authRole: 'Student / Public Profile',
    summary: 'Fetch student TotalPoints, dynamic CurrentLevel, and immutable ScoreTransaction history.',
    responseStatus: 200,
    responseBody: `{
  "studentId": 1084,
  "totalPoints": 400,
  "currentLevel": 3,
  "formula": "FLOOR(SQRT(400 / 100)) + 1 = 3",
  "recentTransactions": [
    { "id": 77, "points": 100, "reason": "Attended Session #105", "sourceType": "Attendance" }
  ]
}`,
  },
  {
    id: 'get-badges',
    method: 'GET',
    controller: 'BadgesController',
    route: '/api/v1/students/1084/badges',
    authRole: 'Student / Public',
    summary: 'Retrieve badges unlocked by the student based on CriteriaType and CriteriaValue.',
    responseStatus: 200,
    responseBody: `{
  "studentId": 1084,
  "badges": [
    {
      "badgeId": 3,
      "name": "Workshop Pioneer",
      "criteriaType": "TotalPoints",
      "criteriaValue": 300,
      "awardedAt": "2026-10-31T14:22:00Z"
    }
  ]
}`,
  },
  {
    id: 'patch-notifications',
    method: 'PATCH',
    controller: 'NotificationsController',
    route: '/api/v1/notifications/mark-all-read',
    authRole: 'Student (Owner Only)',
    summary: 'Mark all unread notifications in the authenticated student inbox as IsRead = true.',
    responseStatus: 200,
    responseBody: `{
  "updatedCount": 4,
  "unreadRemaining": 0,
  "status": "All owner notifications marked as read"
}`,
  },
];

export const STATUS_CODES: StatusCodeSpec[] = [
  {
    code: 200,
    name: '200 OK',
    category: 'Success',
    teamUpContext: 'GET /api/v1/events or PATCH /api/v1/notifications/mark-all-read succeeded.',
    sampleJson: '{ "status": 200, "message": "Request succeeded", "data": [...] }',
  },
  {
    code: 201,
    name: '201 Created',
    category: 'Success',
    teamUpContext: 'POST registration, new event, or session attendance record created in TeamUpDB.',
    sampleJson: '{ "status": 201, "registrationId": 9012, "statusText": "Confirmed" }',
  },
  {
    code: 204,
    name: '204 No Content',
    category: 'Success',
    teamUpContext: 'DELETE /api/v1/notifications/{id} or cancelling an event registration completed with empty body.',
    sampleJson: '// Empty response body (Resource successfully deleted)',
  },
  {
    code: 400,
    name: '400 Bad Request',
    category: 'Client Error',
    teamUpContext: 'Invalid DTO payload (e.g., negative Capacity, invalid VerificationMethod, or missing required fields).',
    sampleJson: '{ "status": 400, "error": "ValidationError", "detail": "Capacity must be greater than 0." }',
  },
  {
    code: 401,
    name: '401 Unauthorized',
    category: 'Client Error',
    teamUpContext: 'Missing or expired JWT Bearer token in Authorization header on an [Authorize] endpoint.',
    sampleJson: '{ "status": 401, "error": "Unauthorized", "detail": "Valid JWT Bearer token required." }',
  },
  {
    code: 403,
    name: '403 Forbidden',
    category: 'Client Error',
    teamUpContext: 'A Student role attempted to call POST /api/v1/events (requires OrgAdmin) or delete another user\'s notification.',
    sampleJson: '{ "status": 403, "error": "Forbidden", "detail": "Role OrgAdmin required for this operation." }',
  },
  {
    code: 404,
    name: '404 Not Found',
    category: 'Client Error',
    teamUpContext: 'Requested EventID, SessionID, or StudentID does not exist in TeamUpDB.',
    sampleJson: '{ "status": 404, "error": "NotFound", "detail": "Event #999 was not found." }',
  },
  {
    code: 409,
    name: '409 Conflict',
    category: 'Client Error',
    teamUpContext: 'Event capacity is full (anti-overbooking lock) OR student already registered/checked into this session.',
    sampleJson: '{ "status": 409, "error": "Conflict", "detail": "Event capacity is full (100/100) or duplicate entry." }',
  },
  {
    code: 500,
    name: '500 Server Error',
    category: 'Server Error',
    teamUpContext: 'Unhandled database exception or transaction rollback inside the backend pipeline.',
    sampleJson: '{ "status": 500, "error": "InternalServerError", "detail": "Transaction rolled back safely." }',
  },
];

export const BOSS_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: '1. TeamUp Business Purpose & Roles',
    question: 'What core problem does TeamUp solve for university students, and which 3 roles govern the platform?',
    options: [
      'Replaces random WhatsApp/Facebook team searches with verified skill portfolios & activities using Student, OrgAdmin, and PlatformAdmin roles.',
      'Provides video streaming lectures using Teacher, Dean, and Guest roles.',
      'Manages university cafeteria payments using Cashier, Student, and Auditor roles.',
      'Replaces campus Wi-Fi routers using NetworkAdmin, Developer, and Moderator roles.',
    ],
    correctIndex: 0,
    explanation:
      'TeamUp connects university students to form skill-matched project teams, join student activities (IEEE, GDG, Enactus, ACM), verify workshop attendance, and earn gamified portfolios under three roles: Student, OrgAdmin, and PlatformAdmin.',
  },
  {
    id: 2,
    topic: '2. Backend Architecture & Stack',
    question: 'Which backend framework and API documentation standard power the 6 RESTful Controllers in TeamUp?',
    options: [
      'PHP 5 with SOAP XML descriptors.',
      'C# / ASP.NET Core (.NET 10) with Swagger / OpenAPI 3.0 documentation.',
      'Ruby on Rails with GraphQL-only resolvers.',
      'Plain static HTML files without a backend server.',
    ],
    correctIndex: 1,
    explanation:
      'The TeamUp Backend is built with C# and ASP.NET Core (.NET 10), exposing 6 RESTful controllers (Events, Registrations, Attendance, Gamification, Badges, Notifications) documented with Swagger / OpenAPI 3.0.',
  },
  {
    id: 3,
    topic: '3. API Communication & Request Lifecycle',
    question: 'When a student clicks "Register" on the Frontend, what is the accurate Backend request lifecycle?',
    options: [
      'Frontend directly edits SQL tables in the browser without calling an API.',
      'User Action → Frontend HTTP Request → ASP.NET Core API Controller → Business Logic & Transaction → TeamUpDB → JSON Response.',
      'Database sends an email to the browser before the user clicks anything.',
      'CSS animations directly generate database primary keys.',
    ],
    correctIndex: 1,
    explanation:
      'Every interaction follows the structured pipeline: User Action → Frontend HTTP Request (with JWT header) → API Controller → Backend Business Logic & Validation → TeamUpDB → HTTP Status + JSON Response.',
  },
  {
    id: 4,
    topic: '4. Database Relationships & Chen ERD',
    question: 'In TeamUpDB (13 Core Entities), how is the Many-to-Many (M:N) relationship between Student and Skill modeled?',
    options: [
      'By storing comma-separated skill names inside the Student FullName column.',
      'Through the StudentSkill junction table, which also stores ProficiencyLevel and YearsOfExperience.',
      'Skills are linked only to Universities, never to Students.',
      'Via a One-to-One link between Notification and Badge.',
    ],
    correctIndex: 1,
    explanation:
      'In the TeamUpDB Chen ERD, Student and Skill have an M:N relationship resolved via the StudentSkill junction table, which stores relationship attributes ProficiencyLevel and YearsOfExperience.',
  },
  {
    id: 5,
    topic: '5. HTTP Methods & Status Codes',
    question: 'Which HTTP method and status code pair is used when marking notifications as read vs. rejecting an overbooked registration?',
    options: [
      'PATCH (200 OK) for mark-all-read; POST returning 409 Conflict when event capacity is full.',
      'GET (500 Error) for mark-all-read; DELETE (200 OK) for overbooking.',
      'PUT (404 Not Found) for all successful requests.',
      'POST (204 No Content) when a user is unauthenticated.',
    ],
    correctIndex: 0,
    explanation:
      'PATCH /api/v1/notifications/mark-all-read performs a partial state update (IsRead = true, 200 OK), while an overbooked or duplicate registration returns 409 Conflict.',
  },
  {
    id: 6,
    topic: '6. Event Registration & Anti-Overbooking Concurrency',
    question: 'How does the TeamUp Backend prevent overbooking when 1 seat remains (Capacity = 100, Registered = 99) and two students click Register at the exact same millisecond?',
    options: [
      'It allows 101 students and deletes a random student the next day.',
      'It wraps seat verification in a Database Transaction with IsolationLevel.Serializable and SQL row locks (UPDLOCK, HOLDLOCK).',
      'It disables the website for 10 minutes after every click.',
      'It relies solely on a frontend CSS disabled class.',
    ],
    correctIndex: 1,
    explanation:
      'To eliminate race conditions, RegistrationsController uses a Database Transaction with IsolationLevel.Serializable and UPDLOCK, HOLDLOCK when reading RegisteredCount—accepting the first request (201) and returning 409 Conflict to the second.',
  },
  {
    id: 7,
    topic: '7. Multi-Method Session Attendance Validation',
    question: 'What 3 attendance verification methods are supported by AttendanceController, and how are duplicate check-ins prevented?',
    options: [
      'QRCode, RFID, and Manual check-in; protected by a UNIQUE (SessionID, StudentID) constraint.',
      'SMS, Fax, and Postal Mail; no duplicate check is performed.',
      'Bluetooth only; duplicates are allowed to earn bonus points.',
      'Selfie upload only; checked manually once per semester.',
    ],
    correctIndex: 0,
    explanation:
      'SessionAttendance supports QRCode, RFID, and Manual verification by an OrgAdmin, and enforces UNIQUE (SessionID, StudentID) in both database schema and backend logic so a student cannot check in twice to farm points.',
  },
  {
    id: 8,
    topic: '8. Gamification & Immutable Score Ledger',
    question: 'Why does TeamUp use the ScoreTransaction table, and what exact mathematical formula calculates a student\'s CurrentLevel?',
    options: [
      'It stores an immutable ledger of every point change; CurrentLevel = FLOOR(SQRT(TotalPoints / 100)) + 1.',
      'It overwrites a single random number; CurrentLevel = TotalPoints * 10.',
      'It deletes old points every week; CurrentLevel = TotalPoints / 1000.',
      'Points are stored only in browser cookies with no backend formula.',
    ],
    correctIndex: 0,
    explanation:
      'ScoreTransaction acts as an immutable audit ledger (Points, Reason, SourceType, CreatedAt). The student\'s level is computed non-linearly via CurrentLevel = FLOOR(SQRT(TotalPoints / 100)) + 1.',
  },
  {
    id: 9,
    topic: '9. JWT Authentication & RBAC Authorization',
    question: 'What is the difference between Authentication and Authorization in TeamUp\'s security architecture?',
    options: [
      'They are identical terms for CSS styling.',
      'Authentication verifies "Who are you?" via JWT Bearer token; Authorization enforces "What are you allowed to do?" via RBAC roles (Student, OrgAdmin, PlatformAdmin) and ownership checks.',
      'Authentication checks event capacity; Authorization calculates square roots.',
      'Authorization happens before login without any token.',
    ],
    correctIndex: 1,
    explanation:
      'Authentication confirms identity via JWT Bearer tokens ([Authorize]), whereas Authorization enforces Role-Based Access Control (only OrgAdmin/PlatformAdmin can manage events/attendance) and resource ownership (students can only modify their own notifications).',
  },
  {
    id: 10,
    topic: '10. Cross-Module Integration & Notification Flow',
    question: 'What happens automatically in the Backend right after an OrgAdmin verifies a student\'s Session Attendance?',
    options: [
      'Nothing else happens; all modules are completely isolated.',
      'A +100 pts ScoreTransaction is logged → TotalPoints & CurrentLevel update → Badge criteria (CriteriaType/Value) are evaluated → StudentBadge is awarded if met → a Notification is delivered to the student.',
      'The event is deleted from TeamUpDB.',
      'All other students lose 100 points.',
    ],
    correctIndex: 1,
    explanation:
      'TeamUp modules are tightly integrated: verified SessionAttendance triggers a +100 pts ScoreTransaction, recalculates CurrentLevel, checks Badge thresholds to auto-award StudentBadge, and pushes an unread Notification to the student\'s inbox.',
  },
];
