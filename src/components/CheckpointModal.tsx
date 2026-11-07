import React, { useState } from 'react';
import {
  CHECKPOINTS,
  ERD_ENTITIES,
  API_ENDPOINTS,
  STATUS_CODES,
  ErdEntityNode,
} from '../data/teamupData';
import { soundEngine } from '../audio/soundEngine';

interface CheckpointModalProps {
  checkpointIndex: number; // 0 to 11
  onNextAndResume: () => void;
  onSelectCheckpoint: (idx: number) => void;
}

export const CheckpointModal: React.FC<CheckpointModalProps> = ({
  checkpointIndex,
  onNextAndResume,
  onSelectCheckpoint,
}) => {
  const cp = CHECKPOINTS[checkpointIndex] || CHECKPOINTS[0];
  const isLastCheckpoint = checkpointIndex === CHECKPOINTS.length - 1;

  // Interactive states for different levels
  const [lifecycleStep, setLifecycleStep] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<ErdEntityNode>(ERD_ENTITIES[2]); // default Student
  const [showOriginalErdImage, setShowOriginalErdImage] = useState<boolean>(false);
  const [selectedEndpointIdx, setSelectedEndpointIdx] = useState<number>(2); // POST registration
  const [selectedStatusIdx, setSelectedStatusIdx] = useState<number>(7); // 409 Conflict
  const [workshopSessions, setWorkshopSessions] = useState([
    { id: 101, title: 'Session 1: Python & Data Cleaning', room: 'Hall B2', time: '10:00 - 12:00' },
    { id: 102, title: 'Session 2: Exploratory Visuals & Pandas', room: 'Lab 4', time: '13:00 - 15:00' },
    { id: 103, title: 'Session 3: Statistical Modeling Capstone', room: 'Auditorium A', time: '15:30 - 17:30' },
  ]);

  // Level 6 Concurrency Race Condition Simulator state
  const [raceSimulated, setRaceSimulated] = useState<boolean>(false);

  // Level 7 Attendance Simulator state
  const [attendanceMethod, setAttendanceMethod] = useState<'QRCode' | 'RFID' | 'Manual'>('QRCode');
  const [checkedInCount, setCheckedInCount] = useState<number>(0);

  // Level 8 Gamification Score Ledger state
  const [ledgerTransactions, setLedgerTransactions] = useState([
    { id: 1, points: 100, reason: 'Welcome Persistent Email Auth Bonus', source: 'AuthSystem', time: '09:00:12' },
    { id: 2, points: 100, reason: 'Attended Data Analysis Session #1', source: 'SessionAttendance', time: '12:04:45' },
    { id: 3, points: 100, reason: 'Completed Project Task #14', source: 'ProjectTask', time: '14:20:09' },
  ]);

  // Level 9 Achievement Unlocked Banner state
  const [badgeUnlockedDemo, setBadgeUnlockedDemo] = useState<boolean>(false);

  // Level 10 Notification Inbox state
  const [notifications, setNotifications] = useState([
    {
      id: 501,
      title: 'Registration Confirmed',
      message: 'Seat #100 reserved for Data Analysis Workshop.',
      type: 'EventRegistration',
      isRead: false,
      time: '2m ago',
    },
    {
      id: 502,
      title: '+100 Points Earned!',
      message: 'QRCode Attendance verified in Session #105.',
      type: 'ScoreTransaction',
      isRead: false,
      time: '1m ago',
    },
    {
      id: 503,
      title: 'Achievement Unlocked: Workshop Pioneer',
      message: 'You reached 300+ TotalPoints! StudentBadge granted.',
      type: 'BadgeAwarded',
      isRead: true,
      time: 'Just now',
    },
  ]);

  // Level 11 Cross-Module Flow step
  const [cascadeStep, setCascadeStep] = useState<number>(5);

  // Level 12 Security Role Simulator
  const [activeRole, setActiveRole] = useState<'Student' | 'OrgAdmin' | 'PlatformAdmin'>('Student');

  const totalPoints = ledgerTransactions.reduce((acc, t) => acc + t.points, 0);
  const calculatedLevel = Math.floor(Math.sqrt(totalPoints / 100)) + 1;

  const handleAddPoints = (reason: string, source: string) => {
    soundEngine.playCheckpoint();
    setLedgerTransactions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        points: 100,
        reason,
        source,
        time: new Date().toLocaleTimeString([], { hour12: false }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 md:p-6 bg-[#202124]/65">
      <div
        className="retro-box w-full max-w-6xl max-h-[90vh] flex flex-col bg-[#ffffff] text-[#202124] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkpoint-title"
      >
        {/* Top Retro Title Bar */}
        <div className="bg-[#202124] text-[#f7f7f7] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#202124]">
          <div className="flex items-center gap-3">
            <span className="bg-[#f7f7f7] text-[#202124] font-pixel text-[10px] px-2.5 py-1">
              {cp.code} ({checkpointIndex + 1}/{CHECKPOINTS.length})
            </span>
            <span className="font-pixel text-xs md:text-sm tracking-wide text-[#f7f7f7]">
              {cp.levelLabel}
            </span>
          </div>

          {/* Quick Level Switcher Pills for Defense Q&A */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {CHECKPOINTS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectCheckpoint(idx);
                }}
                className={`px-2 py-1 font-code text-[11px] font-bold border transition-colors ${
                  idx === checkpointIndex
                    ? 'bg-[#f7f7f7] text-[#202124] border-[#f7f7f7]'
                    : 'bg-[#333438] text-[#cfcfcf] border-[#535353] hover:bg-[#535353]'
                }`}
                title={`${item.code}: ${item.title}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Subheader with Title & Subtitle */}
        <div className="bg-[#f7f7f7] px-6 py-4 border-b-2 border-[#202124] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="checkpoint-title" className="font-pixel text-base md:text-lg text-[#202124]">
              {cp.title}
            </h2>
            <p className="text-xs md:text-sm font-code text-[#535353] mt-1">{cp.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-code text-[#535353]">
            <span>OBSTACLE CLEARED</span>
            <span>·</span>
            <span>GAME PAUSED FOR BRIEFING</span>
          </div>
        </div>

        {/* Main Scrollable Educational Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-[#ffffff]">
          {/* LEVEL 1: WHAT IS TEAMUP? */}
          {checkpointIndex === 0 && (
            <div className="space-y-6">
              {/* Problem vs Solution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                  <div className="font-pixel text-xs text-[#202124] mb-3 pb-2 border-b border-[#535353]">
                    01. THE UNIVERSITY PROBLEM
                  </div>
                  <ul className="space-y-2.5 text-sm text-[#202124]">
                    <li className="flex items-start gap-2">
                      <span className="font-code font-bold">[1]</span>
                      <span>
                        <strong>Skill-Mismatch in Teams:</strong> University students (Years 1–4) struggle to find teammates with complementary skills for course projects, hackathons, or graduation projects.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-code font-bold">[2]</span>
                      <span>
                        <strong>Chaotic Search Channels:</strong> Team formation happens randomly on WhatsApp & Facebook groups without knowing real technical proficiency or student commitment.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-code font-bold">[3]</span>
                      <span>
                        <strong>Unverified Activities:</strong> Student Activities & Workshops are scattered with no unified platform converting real attendance into a <strong>Verified Skill Portfolio</strong>.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                  <div className="font-pixel text-xs text-[#202124] mb-3 pb-2 border-b border-[#535353]">
                    02. THE TEAMUP SOLUTION & 3 SYSTEM ROLES
                  </div>
                  <p className="text-sm text-[#202124] mb-3">
                    <strong>Slogan:</strong> <em>&ldquo;Build Your Skills. Find Your Team. Grow Together.&rdquo;</em> — A unified university collaboration & skill-building network.
                  </p>
                  <div className="space-y-2 text-xs font-code">
                    <div className="p-2 bg-white border border-[#535353]">
                      <strong>1. Student:</strong> Creates projects, applies to teams, joins clubs, books workshops, and earns verified points & badges.
                    </div>
                    <div className="p-2 bg-white border border-[#535353]">
                      <strong>2. OrgAdmin:</strong> Manages student activity pages (IEEE, GDG, Enactus, ACM), reviews join requests, creates events/sessions, and verifies attendance (QR/RFID/Manual).
                    </div>
                    <div className="p-2 bg-white border border-[#535353]">
                      <strong>3. PlatformAdmin:</strong> Manages the university-wide Badge catalog and monitors score ledgers & platform integrity.
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Core Business Modules */}
              <div className="retro-box-sm p-4">
                <div className="font-pixel text-xs text-[#202124] mb-3">
                  03. THE 5 CORE BUSINESS MODULES (MAIN NAVIGATION BAR)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-[#f7f7f7] border border-[#202124]">
                    <div className="font-code font-bold text-[#202124] mb-1">M1 · Team Formation</div>
                    <p className="text-[#535353]">
                      Create projects, set <code>MaxTeamSize</code>, <code>Required Skills</code> (<code>IsMandatory</code>), apply (<code>AppliesTo</code>), & manage <code>Project Tasks Board</code>.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f7f7f7] border border-[#202124]">
                    <div className="font-code font-bold text-[#202124] mb-1">M2 · Profiles & Scoring</div>
                    <p className="text-[#535353]">
                      Academic profile (Faculty, Year, GitHub, LinkedIn), skills with <code>ProficiencyLevel</code>, and verified participation history.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f7f7f7] border border-[#202124]">
                    <div className="font-code font-bold text-[#202124] mb-1">M3 · Student Activities</div>
                    <p className="text-[#535353]">
                      Campus directory for IEEE, GDG, Enactus, ACM recruitment, join applications (<code>OrgJoinRequest</code>), & member rosters.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f7f7f7] border border-[#202124]">
                    <div className="font-code font-bold text-[#202124] mb-1">M4 · Events & Workshops</div>
                    <p className="text-[#535353]">
                      Capacity-controlled registration (<code>Capacity</code>), multi-session breakdown (<code>EventSessions</code>), & live attendance proof.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f7f7f7] border border-[#202124]">
                    <div className="font-code font-bold text-[#202124] mb-1">M5 · Gamification</div>
                    <p className="text-[#535353]">
                      Immutable <code>ScoreTransaction</code> ledger, square-root level formula, auto-awarded <code>Badges</code>, & Campus Leaderboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* System Architecture Diagram + Implemented vs Proposed */}
              <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                <div className="font-pixel text-xs text-[#202124] mb-3">
                  04. OVERALL SYSTEM ARCHITECTURE & IMPLEMENTATION STATUS
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center font-code text-xs mb-4">
                  <div className="p-3 bg-white border-2 border-[#202124]">
                    <div className="font-pixel text-[11px] mb-1">FRONTEND LAYER</div>
                    <div className="text-[#535353]">Responsive Web UI · Morphing Sticky Header · 5 Modules & 26 Sub-Actions</div>
                  </div>
                  <div className="p-3 bg-[#202124] text-[#f7f7f7] border-2 border-[#202124]">
                    <div className="font-pixel text-[11px] mb-1">BACKEND ENGINE</div>
                    <div className="text-[#cfcfcf]">C# / ASP.NET Core (.NET 10) · 6 REST Controllers · JWT + RBAC · OpenAPI 3.0</div>
                  </div>
                  <div className="p-3 bg-white border-2 border-[#202124]">
                    <div className="font-pixel text-[11px] mb-1">DATABASE LAYER</div>
                    <div className="text-[#535353]">TeamUpDB (Chen ERD) · 13 Core Entities · Serializable Transactions</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-code">
                  <div className="p-2.5 bg-white border border-[#202124]">
                    <strong>[IMPLEMENTED IN PROJECT]:</strong> 13-Entity Chen ERD (<code>TeamUpDB</code>), C# .NET 10 Backend with 6 RESTful Controllers (Events, Registrations, Attendance, Gamification, Badges, Notifications), Serializable Anti-Overbooking Lock, Immutable Score Ledger, and Interactive Frontend Landing & Auth UI.
                  </div>
                  <div className="p-2.5 bg-white border border-[#535353]">
                    <strong>[PROPOSED ROADMAP / NEXT PHASE]:</strong> Full end-to-end binding of all 26 sub-screens (live Kanban drag-and-drop board, camera hardware QR/RFID scanner integration, and campus-wide live WebSocket leaderboard).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 2: UNDERSTANDING THE BACKEND */}
          {checkpointIndex === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                  <div className="font-pixel text-xs text-[#202124] mb-3">
                    01. C# / ASP.NET CORE (.NET 10) ARCHITECTURE
                  </div>
                  <p className="text-sm text-[#202124] mb-3">
                    The Backend is the brain that enforces business rules, security, and data integrity. In TeamUp, it is engineered using <strong>C# and ASP.NET Core (.NET 10)</strong> and documented via <strong>Swagger / OpenAPI 3.0</strong>.
                  </p>
                  <div className="space-y-2 text-xs font-code">
                    <div className="p-2 bg-white border border-[#202124]">
                      <strong>Controllers (API Layer):</strong> Receive HTTP requests, validate routes/headers, and return HTTP status codes + JSON DTOs.
                    </div>
                    <div className="p-2 bg-white border border-[#202124]">
                      <strong>Business Logic & Services:</strong> Enforce capacity locks, duplicate checks, score ledger math, and automatic badge triggers.
                    </div>
                    <div className="p-2 bg-white border border-[#202124]">
                      <strong>Data Access & TeamUpDB:</strong> Executes parameterized SQL / ORM queries and ACID transactions against the 13 entities.
                    </div>
                  </div>
                </div>

                <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                  <div className="font-pixel text-xs text-[#202124] mb-3">
                    02. THE 6 RESTFUL CONTROLLERS IN TEAMUP
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-code">
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>1. EventsController</strong>
                      <div className="text-[#535353] mt-0.5">/api/v1/events</div>
                      <div className="text-[11px] mt-1">CRUD for workshops, capacities & sessions.</div>
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>2. RegistrationsController</strong>
                      <div className="text-[#535353] mt-0.5">/api/v1/events/&#123;id&#125;/registrations</div>
                      <div className="text-[11px] mt-1">Seat booking, concurrency lock & cancellation.</div>
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>3. AttendanceController</strong>
                      <div className="text-[#535353] mt-0.5">/api/v1/sessions/&#123;id&#125;/attendance</div>
                      <div className="text-[11px] mt-1">QRCode, RFID, and Manual check-in proof.</div>
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>4. GamificationController</strong>
                      <div className="text-[#535353] mt-0.5">/api/v1/students/&#123;id&#125;/score</div>
                      <div className="text-[11px] mt-1">ScoreTransactions & dynamic level calculation.</div>
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>5. BadgesController</strong>
                      <div className="text-[#535353] mt-0.5">/api/v1/badges</div>
                      <div className="text-[11px] mt-1">Badge catalog & StudentBadge awards.</div>
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>6. NotificationsController</strong>
                      <div className="text-[#535353] mt-0.5">/api/v1/notifications</div>
                      <div className="text-[11px] mt-1">Student inbox, read states & mark-all-read.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Request Lifecycle Stepper */}
              <div className="retro-box-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    03. INTERACTIVE VISUAL REQUEST LIFECYCLE (CLICK ANY STAGE)
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setLifecycleStep((prev) => (prev + 1) % 6);
                    }}
                    className="retro-btn px-3 py-1 text-xs font-code"
                  >
                    Step Forward ({lifecycleStep + 1}/6) →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-code mb-4">
                  {[
                    { step: 0, title: '1. User Action', desc: 'Student clicks "Register" on Workshop #42' },
                    { step: 1, title: '2. Frontend', desc: 'Sends fetch() with Bearer JWT token' },
                    { step: 2, title: '3. REST API', desc: 'POST /api/v1/events/42/registrations' },
                    { step: 3, title: '4. Backend Logic', desc: 'Validates JWT, checks Capacity & duplicates' },
                    { step: 4, title: '5. TeamUpDB', desc: 'Locks row (UPDLOCK), inserts Registration' },
                    { step: 5, title: '6. JSON Response', desc: 'Returns HTTP 201 Created + JSON DTO' },
                  ].map((item) => (
                    <button
                      key={item.step}
                      onClick={() => {
                        soundEngine.playClick();
                        setLifecycleStep(item.step);
                      }}
                      className={`p-2.5 text-left border-2 transition-transform ${
                        lifecycleStep === item.step
                          ? 'bg-[#202124] text-[#f7f7f7] border-[#202124] -translate-y-0.5'
                          : 'bg-[#f7f7f7] text-[#202124] border-[#535353]'
                      }`}
                    >
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className={lifecycleStep === item.step ? 'text-[#e0e0e0]' : 'text-[#535353]'}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-[#202124] text-[#f7f7f7] p-3 font-code text-xs overflow-x-auto">
                  {lifecycleStep === 0 && (
                    <span>[STAGE 1 - USER ACTION]: Student #1084 clicks &ldquo;Register Now&rdquo; on IEEE Data Analysis Workshop (EventID = 42).</span>
                  )}
                  {lifecycleStep === 1 && (
                    <span>[STAGE 2 - FRONTEND HTTP REQUEST]: POST https://teamup.edu/api/v1/events/42/registrations | Header: Authorization: Bearer eyJhbGci...</span>
                  )}
                  {lifecycleStep === 2 && (
                    <span>[STAGE 3 - CONTROLLER ROUTING]: ASP.NET Core routes request to RegistrationsController.RegisterStudent(int eventId = 42).</span>
                  )}
                  {lifecycleStep === 3 && (
                    <span>[STAGE 4 - BUSINESS LOGIC]: Verifies Event #42 is Open, Student #1084 is not already registered, and RegisteredCount (99) &lt; Capacity (100).</span>
                  )}
                  {lifecycleStep === 4 && (
                    <span>[STAGE 5 - DATABASE TRANSACTION]: Begins Serializable transaction with UPDLOCK, HOLDLOCK → Inserts EventRegistration → Increments RegisteredCount to 100.</span>
                  )}
                  {lifecycleStep === 5 && (
                    <span>[STAGE 6 - JSON RESPONSE]: HTTP/1.1 201 Created — &#123; &quot;registrationId&quot;: 9012, &quot;status&quot;: &quot;Confirmed&quot;, &quot;remainingSeats&quot;: 0 &#125;</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 3: DATABASE & ERD */}
          {checkpointIndex === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f7f7f7] p-3 border-2 border-[#202124]">
                <div className="text-xs font-code">
                  <strong>TeamUpDB (Chen ERD):</strong> 13 Core Entities + M:N Junction Tables. Click any entity below to inspect its Primary Key, Foreign Keys, Attributes, and Relationships!
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowOriginalErdImage((v) => !v);
                  }}
                  className="retro-btn px-3 py-1.5 text-xs font-code shrink-0"
                >
                  {showOriginalErdImage ? '← Back to Interactive Entity Explorer' : 'View Attached Chen ERD Diagram →'}
                </button>
              </div>

              {showOriginalErdImage ? (
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-[#202124]">
                      ATTACHED PROJECT CHEN ERD DIAGRAM (TeamUpDB)
                    </span>
                    <span className="text-xs font-code text-[#535353]">
                      Source: /assets/aistudio/Screenshot_2026-10-31_232527_a830f67a.png
                    </span>
                  </div>
                  <div className="border-2 border-[#202124] bg-white p-2 overflow-auto max-h-[52vh]">
                    <img
                      src="/assets/aistudio/Screenshot_2026-10-31_232527_a830f67a.png"
                      alt="TeamUpDB Chen Entity Relationship Diagram showing all 13 entities and relationships"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: 13 Entities Grid */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="font-pixel text-xs text-[#202124]">
                      SELECT AN ENTITY (13 CORE ENTITIES IN TEAMUPDB):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ERD_ENTITIES.map((ent) => {
                        const isSelected = selectedEntity.id === ent.id;
                        const isConnected = selectedEntity.relationships.some(
                          (r) => r.target === ent.id
                        );
                        return (
                          <button
                            key={ent.id}
                            onClick={() => {
                              soundEngine.playClick();
                              setSelectedEntity(ent);
                            }}
                            className={`p-2.5 text-left font-code text-xs border-2 transition-all ${
                              isSelected
                                ? 'bg-[#202124] text-[#f7f7f7] border-[#202124] shadow-[3px_3px_0px_#757575]'
                                : isConnected
                                ? 'bg-[#ebebeb] text-[#202124] border-[#202124]'
                                : 'bg-[#ffffff] text-[#535353] border-[#757575] hover:border-[#202124]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate">{ent.name}</span>
                              {isSelected && <span className="text-[10px]">[ACTIVE]</span>}
                              {!isSelected && isConnected && <span className="text-[10px]">[LINKED]</span>}
                            </div>
                            <div
                              className={`text-[10px] mt-1 truncate ${
                                isSelected ? 'text-[#cfcfcf]' : 'text-[#757575]'
                              }`}
                            >
                              PK: {ent.pk}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Key Cardinality Summary Box */}
                    <div className="p-3 bg-[#f7f7f7] border-2 border-[#202124] text-xs font-code space-y-1.5">
                      <div className="font-bold text-[#202124]">RELATIONAL CARDINALITY SUMMARY:</div>
                      <div>• <strong>1:1 Relationship:</strong> <code>Student</code> (1) ──&gt; <code>StudentProfile</code> (1)</div>
                      <div>• <strong>1:N Hierarchies:</strong> <code>University</code> → <code>Faculty</code> → <code>Student</code> | <code>Organization</code> → <code>Event</code> → <code>EventSession</code> | <code>Project</code> → <code>Task</code></div>
                      <div>• <strong>M:N Junction Tables:</strong> <code>StudentSkill</code>, <code>ProjectRequiredSkill</code>, <code>ProjectApplication</code>, <code>ProjectMember</code>, <code>OrgJoinRequest</code>, <code>OrgMember</code>, <code>EventRegistration</code>, <code>SessionAttendance</code>, <code>StudentBadge</code></div>
                    </div>
                  </div>

                  {/* Right: Selected Entity Inspector */}
                  <div className="lg:col-span-5 retro-box-sm p-4 bg-[#f7f7f7] flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b-2 border-[#202124] pb-2">
                        <div>
                          <span className="text-[11px] font-code text-[#535353]">
                            {selectedEntity.category}
                          </span>
                          <h3 className="font-pixel text-sm text-[#202124]">
                            ENTITY: {selectedEntity.name}
                          </h3>
                        </div>
                        <span className="bg-[#202124] text-[#f7f7f7] px-2 py-1 font-code text-xs">
                          PK: {selectedEntity.pk}
                        </span>
                      </div>

                      <p className="text-xs text-[#202124] leading-relaxed">
                        {selectedEntity.description}
                      </p>

                      <div>
                        <div className="font-code text-xs font-bold text-[#202124] mb-1">
                          ATTRIBUTES & KEYS:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEntity.attributes.map((attr) => (
                            <span
                              key={attr}
                              className="bg-white border border-[#202124] px-2 py-0.5 font-code text-[11px]"
                            >
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>

                      {selectedEntity.junctionTables && selectedEntity.junctionTables.length > 0 && (
                        <div>
                          <div className="font-code text-xs font-bold text-[#202124] mb-1">
                            JUNCTION / RELATIONSHIP TABLES:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEntity.junctionTables.map((jt) => (
                              <span
                                key={jt}
                                className="bg-[#202124] text-[#f7f7f7] px-2 py-0.5 font-code text-[11px]"
                              >
                                {jt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="font-code text-xs font-bold text-[#202124] mb-1">
                          CONNECTED RELATIONSHIPS:
                        </div>
                        <div className="space-y-1.5">
                          {selectedEntity.relationships.map((rel, i) => (
                            <div
                              key={i}
                              className="bg-white border border-[#535353] p-2 font-code text-xs flex items-center justify-between"
                            >
                              <span>
                                <strong>{selectedEntity.name}</strong> ──[{rel.cardinality}]──&gt;{' '}
                                <strong>{rel.target}</strong>
                                {rel.via ? ` via ${rel.via}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEVEL 4: API & HTTP METHODS */}
          {checkpointIndex === 3 && (
            <div className="space-y-6">
              {/* HTTP Methods Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-code text-xs">
                {[
                  { verb: 'GET', role: 'Retrieve Data', ex: 'GET /api/v1/events' },
                  { verb: 'POST', role: 'Create Resource', ex: 'POST /api/v1/events/{id}/registrations' },
                  { verb: 'PUT', role: 'Replace/Update', ex: 'PUT /api/v1/events/{id}' },
                  { verb: 'PATCH', role: 'Partial Update', ex: 'PATCH /api/v1/notifications/mark-all-read' },
                  { verb: 'DELETE', role: 'Delete/Cancel', ex: 'DELETE /api/v1/events/{id}/registrations/{regId}' },
                ].map((m) => (
                  <div key={m.verb} className="p-2.5 bg-[#f7f7f7] border-2 border-[#202124]">
                    <div className="font-pixel text-xs text-[#202124]">{m.verb}</div>
                    <div className="font-bold text-[#535353] mt-0.5">{m.role}</div>
                    <div className="text-[10px] text-[#535353] mt-1 truncate">{m.ex}</div>
                  </div>
                ))}
              </div>

              {/* Interactive Endpoint Explorer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 space-y-2">
                  <div className="font-pixel text-xs text-[#202124]">
                    ACTUAL TEAMUP ENDPOINTS (CLICK TO INSPECT):
                  </div>
                  <div className="space-y-1.5">
                    {API_ENDPOINTS.map((ep, idx) => (
                      <button
                        key={ep.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedEndpointIdx(idx);
                        }}
                        className={`w-full p-2.5 text-left font-code text-xs border-2 flex items-center justify-between gap-2 ${
                          selectedEndpointIdx === idx
                            ? 'bg-[#202124] text-[#f7f7f7] border-[#202124]'
                            : 'bg-[#f7f7f7] text-[#202124] border-[#535353] hover:border-[#202124]'
                        }`}
                      >
                        <span className="truncate">
                          <strong>{ep.method}</strong> {ep.route}
                        </span>
                        <span className="text-[10px] shrink-0">[{ep.responseStatus}]</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 retro-box-sm p-4 bg-[#202124] text-[#f7f7f7] font-code text-xs space-y-3">
                  {(() => {
                    const ep = API_ENDPOINTS[selectedEndpointIdx];
                    return (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#535353] pb-2">
                          <div>
                            <span className="bg-[#f7f7f7] text-[#202124] font-bold px-2 py-0.5 mr-2">
                              {ep.method}
                            </span>
                            <span className="text-sm font-bold">{ep.route}</span>
                          </div>
                          <span className="text-[#cfcfcf]">
                            Controller: {ep.controller} · Auth: {ep.authRole}
                          </span>
                        </div>
                        <p className="text-[#e0e0e0]">{ep.summary}</p>
                        {ep.requestBody && (
                          <div>
                            <div className="text-[#cfcfcf] mb-1">REQUEST BODY (JSON):</div>
                            <pre className="bg-[#141518] p-2.5 border border-[#535353] overflow-x-auto text-[11px]">
                              {ep.requestBody}
                            </pre>
                          </div>
                        )}
                        <div>
                          <div className="text-[#cfcfcf] mb-1">
                            RESPONSE ({ep.responseStatus}):
                          </div>
                          <pre className="bg-[#141518] p-2.5 border border-[#535353] overflow-x-auto text-[11px]">
                            {ep.responseBody}
                          </pre>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* HTTP Status Codes Interactive Bar */}
              <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                <div className="font-pixel text-xs text-[#202124] mb-2">
                  HTTP STATUS CODES IN TEAMUP (CLICK ANY CODE):
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {STATUS_CODES.map((sc, idx) => (
                    <button
                      key={sc.code}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedStatusIdx(idx);
                      }}
                      className={`px-3 py-1.5 font-code text-xs font-bold border-2 ${
                        selectedStatusIdx === idx
                          ? 'bg-[#202124] text-[#f7f7f7] border-[#202124]'
                          : 'bg-white text-[#202124] border-[#535353]'
                      }`}
                    >
                      {sc.code}
                    </button>
                  ))}
                </div>
                <div className="bg-white border-2 border-[#202124] p-3 font-code text-xs space-y-1">
                  <div>
                    <strong>{STATUS_CODES[selectedStatusIdx].name}</strong> ({STATUS_CODES[selectedStatusIdx].category}) — {STATUS_CODES[selectedStatusIdx].teamUpContext}
                  </div>
                  <div className="text-[#535353]">{STATUS_CODES[selectedStatusIdx].sampleJson}</div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 5: EVENTS & WORKSHOPS */}
          {checkpointIndex === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. EVENTS & WORKSHOPS ARCHITECTURE
                  </div>
                  <p className="text-sm text-[#202124]">
                    Managed by <code>EventsController</code> (<code>/api/v1/events</code>). Campus organizations (such as <strong>IEEE, GDG, Enactus, ACM</strong>) create workshops and competitions with strict seat <code>Capacity</code>.
                  </p>
                  <div className="space-y-2 text-xs font-code">
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>Organizer Permissions (RBAC):</strong> Only authenticated users with role <code>OrgAdmin</code> or <code>PlatformAdmin</code> can create, update, or delete events.
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>1:N Event → EventSession Relationship:</strong> A single parent <code>Event</code> contains multiple scheduled <code>EventSession</code> records so attendance is tracked per session.
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>Capacity Tracking:</strong> Each <code>Event</code> defines <code>Capacity</code> (e.g. 100 seats) and tracks live <code>RegisteredCount</code>.
                    </div>
                  </div>
                </div>

                {/* Practical Interactive Workshop Builder */}
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-[#202124]">
                      02. PRACTICAL EXAMPLE: DATA ANALYSIS WORKSHOP
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setWorkshopSessions((prev) => [
                          ...prev,
                          {
                            id: 100 + prev.length + 1,
                            title: `Session ${prev.length + 1}: Advanced Case Study`,
                            room: `Lab ${prev.length + 2}`,
                            time: '16:00 - 18:00',
                          },
                        ]);
                      }}
                      className="retro-btn px-2.5 py-1 text-xs font-code"
                    >
                      + Add EventSession
                    </button>
                  </div>

                  <div className="p-3 bg-[#202124] text-[#f7f7f7] font-code text-xs">
                    <div><strong>PARENT EVENT (EventID: 42):</strong> IEEE Data Analysis Workshop</div>
                    <div className="text-[#cfcfcf] mt-1">
                      Organization: IEEE Campus Branch · Capacity: 100 Seats · Role Required: [Authorize(Roles = &quot;OrgAdmin,PlatformAdmin&quot;)]
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-code text-xs font-bold text-[#535353]">
                      CHILD SESSIONS (1:N EventSession Table):
                    </div>
                    {workshopSessions.map((ses) => (
                      <div
                        key={ses.id}
                        className="p-2.5 bg-white border-2 border-[#202124] font-code text-xs flex items-center justify-between"
                      >
                        <div>
                          <strong>[SessionID #{ses.id}]</strong> {ses.title}
                        </div>
                        <div className="text-[#535353]">
                          {ses.room} · {ses.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 6: EVENT REGISTRATION & CONCURRENCY */}
          {checkpointIndex === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. CONCURRENCY & ANTI-OVERBOOKING ENGINE
                  </div>
                  <p className="text-sm text-[#202124]">
                    <strong>The Race Condition Problem:</strong> Suppose an event has <code>Capacity = 100</code> and <code>RegisteredCount = 99</code> (only 1 seat left). What happens if <strong>Student A</strong> and <strong>Student B</strong> click &ldquo;Register&rdquo; at the exact same millisecond?
                  </p>
                  <div className="bg-[#202124] text-[#f7f7f7] p-3 font-code text-xs overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed">{`// RegistrationsController.cs - C# .NET 10 Anti-Overbooking Logic
using var tx = await _db.Database.BeginTransactionAsync(
    IsolationLevel.Serializable);

// Acquire row-level update & hold lock while reading capacity
var ev = await _db.Events
    .FromSqlRaw("SELECT * FROM Events WITH (UPDLOCK, HOLDLOCK) WHERE EventID = {0}", eventId)
    .FirstOrDefaultAsync();

if (ev.RegisteredCount >= ev.Capacity) {
    return Conflict(new { error = "409 Conflict: Event capacity is full" });
}

// Reserve final seat #100 for Student A & commit
ev.RegisteredCount += 1;
_db.EventRegistrations.Add(new EventRegistration(eventId, studentId));
await _db.SaveChangesAsync();
await tx.CommitAsync(); // Returns 201 Created`}</pre>
                  </div>
                </div>

                {/* Live Race Condition Simulator */}
                <div className="retro-box-sm p-4 bg-[#f7f7f7] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-xs text-[#202124]">
                        02. SIMULATE LAST-SEAT RACE CONDITION
                      </span>
                      <button
                        onClick={() => {
                          soundEngine.playCheckpoint();
                          setRaceSimulated((v) => !v);
                        }}
                        className="retro-btn px-3 py-1.5 text-xs font-code"
                      >
                        {raceSimulated ? 'Reset To 99/100 Seats' : 'Fire Simultaneous Requests!'}
                      </button>
                    </div>

                    <div className="p-3 bg-white border-2 border-[#202124] font-code text-xs flex items-center justify-between">
                      <span>WORKSHOP CAPACITY STATUS:</span>
                      <span className="font-pixel text-xs">
                        {raceSimulated ? '100 / 100 (FULL)' : '99 / 100 (1 SEAT LEFT)'}
                      </span>
                    </div>

                    <div className="space-y-2.5 font-code text-xs">
                      <div className="p-3 bg-white border-2 border-[#202124]">
                        <div className="font-bold">Request #1: Student A (t = 0.001s)</div>
                        <div className="text-[#535353] mt-1">
                          {raceSimulated
                            ? '→ Acquires UPDLOCK, HOLDLOCK first. Reads 99 < 100. Increments to 100. Returns HTTP 201 Created (Confirmed!).'
                            : 'Waiting to send POST /api/v1/events/42/registrations...'}
                        </div>
                      </div>

                      <div className="p-3 bg-white border-2 border-[#202124]">
                        <div className="font-bold">Request #2: Student B (t = 0.001s)</div>
                        <div className="text-[#535353] mt-1">
                          {raceSimulated
                            ? '→ Blocked by HOLDLOCK until Tx #1 commits. Reads RegisteredCount = 100. Returns HTTP 409 Conflict (Event capacity is full)!'
                            : 'Waiting to send POST /api/v1/events/42/registrations...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-[#535353] text-xs font-code">
                    <strong>Additional Validation Rules:</strong> Duplicate registration prevention (same student cannot book twice) and registration cancellation (releases seat back to pool).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 7: SESSION ATTENDANCE */}
          {checkpointIndex === 6 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. MULTI-METHOD ATTENDANCE VERIFICATION
                  </div>
                  <p className="text-sm text-[#202124]">
                    Registering for an event (<code>EventRegistration</code>) only reserves a seat. Points and verified portfolio records are earned only when <code>AttendanceController</code> (<code>/api/v1/sessions/&#123;id&#125;/attendance</code>) verifies physical attendance in an <code>EventSession</code>!
                  </p>
                  <div className="grid grid-cols-3 gap-2 font-code text-xs">
                    {(['QRCode', 'RFID', 'Manual'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          soundEngine.playClick();
                          setAttendanceMethod(method);
                          setCheckedInCount(0);
                        }}
                        className={`p-2.5 border-2 font-bold ${
                          attendanceMethod === method
                            ? 'bg-[#202124] text-[#f7f7f7] border-[#202124]'
                            : 'bg-white text-[#202124] border-[#535353]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-white border-2 border-[#202124] font-code text-xs space-y-1.5">
                    <div>
                      <strong>Selected Verification Method: {attendanceMethod}</strong>
                    </div>
                    {attendanceMethod === 'QRCode' && (
                      <div className="text-[#535353]">
                        Student scans dynamic session QR token; Backend validates session window & student registration.
                      </div>
                    )}
                    {attendanceMethod === 'RFID' && (
                      <div className="text-[#535353]">
                        Student taps university RFID smart card at workshop entrance reader; Backend maps card UID to StudentID.
                      </div>
                    )}
                    {attendanceMethod === 'Manual' && (
                      <div className="text-[#535353]">
                        Authorized <code>OrgAdmin</code> checks student in from the session roster dashboard.
                      </div>
                    )}
                  </div>
                </div>

                {/* Duplicate Attendance Constraint Tester */}
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    02. ANTI-DUPLICATE CONSTRAINT: UNIQUE (SessionID, StudentID)
                  </div>
                  <p className="text-xs font-code text-[#535353]">
                    Test checking in Student #1084 to Session #105 below. Click once to verify attendance (+100 pts), then click a second time to test duplicate prevention:
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (checkedInCount === 0) {
                          soundEngine.playCheckpoint();
                        } else {
                          soundEngine.playBossAttack();
                        }
                        setCheckedInCount((c) => c + 1);
                      }}
                      className="retro-btn px-4 py-2 text-xs font-code"
                    >
                      {checkedInCount === 0
                        ? `Check-In Student #1084 via ${attendanceMethod}`
                        : 'Attempt Duplicate Check-In Again!'}
                    </button>
                    {checkedInCount > 0 && (
                      <button
                        onClick={() => setCheckedInCount(0)}
                        className="retro-btn-secondary px-3 py-2 text-xs font-code"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="bg-[#202124] text-[#f7f7f7] p-3 font-code text-xs">
                    {checkedInCount === 0 && (
                      <span>[READY]: Waiting for POST /api/v1/sessions/105/attendance...</span>
                    )}
                    {checkedInCount === 1 && (
                      <span>
                        [HTTP 201 CREATED]: SessionAttendance recorded (Method: {attendanceMethod}). Triggered ScoreTransaction (+100 pts) for Student #1084!
                      </span>
                    )}
                    {checkedInCount >= 2 && (
                      <span>
                        [HTTP 409 CONFLICT]: Blocked by UNIQUE (SessionID=105, StudentID=1084) constraint! Student cannot check in twice or farm duplicate points.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 8: GAMIFICATION & SCORE LEDGER */}
          {checkpointIndex === 7 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. DYNAMIC NON-LINEAR LEVEL FORMULA
                  </div>
                  <div className="bg-[#202124] text-[#f7f7f7] p-3 font-code text-xs text-center">
                    CurrentLevel = FLOOR(SQRT(TotalPoints / 100)) + 1
                  </div>
                  <p className="text-xs text-[#202124] leading-relaxed">
                    Instead of a static mutable number, TeamUp computes levels dynamically using a square-root progression curve. Early levels are quick and encouraging for 1st-year students, while higher levels require sustained campus contribution.
                  </p>

                  <div className="p-3 bg-white border-2 border-[#202124] font-code text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span>LIVE TOTAL POINTS:</span>
                      <span className="font-pixel text-sm">{totalPoints} PTS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>FORMULA CALCULATION:</span>
                      <span>
                        floor(√({totalPoints}/100)) + 1
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#535353] pt-2">
                      <span>COMPUTED STUDENT LEVEL:</span>
                      <span className="bg-[#202124] text-[#f7f7f7] px-2 py-0.5 font-pixel text-xs">
                        LEVEL {calculatedLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleAddPoints('Verified Session Attendance (+100)', 'SessionAttendance')
                      }
                      className="retro-btn px-3 py-1.5 text-xs font-code"
                    >
                      +100 pts (Attend Workshop)
                    </button>
                    <button
                      onClick={() =>
                        handleAddPoints('Completed Project Task (+100)', 'ProjectTask')
                      }
                      className="retro-btn-secondary px-3 py-1.5 text-xs font-code"
                    >
                      +100 pts (Complete Task)
                    </button>
                  </div>
                </div>

                {/* Immutable ScoreTransaction Ledger Table */}
                <div className="lg:col-span-7 retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    02. IMMUTABLE SCORE LEDGER (ScoreTransaction Table)
                  </div>
                  <p className="text-xs font-code text-[#535353]">
                    Every point earned is recorded as an append-only financial transaction containing <code>Points</code>, <code>Reason</code>, <code>SourceType</code>, and <code>CreatedAt</code>—preventing arbitrary tampering.
                  </p>
                  <div className="bg-white border-2 border-[#202124] overflow-hidden">
                    <table className="w-full text-left font-code text-xs">
                      <thead className="bg-[#202124] text-[#f7f7f7]">
                        <tr>
                          <th className="p-2">TxID</th>
                          <th className="p-2">Points</th>
                          <th className="p-2">Reason</th>
                          <th className="p-2">SourceType</th>
                          <th className="p-2">CreatedAt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#cfcfcf]">
                        {ledgerTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="p-2 font-bold">#{tx.id}</td>
                            <td className="p-2 font-bold">+{tx.points}</td>
                            <td className="p-2">{tx.reason}</td>
                            <td className="p-2">{tx.source}</td>
                            <td className="p-2 text-[#535353]">{tx.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 9: BADGES & ACHIEVEMENTS */}
          {checkpointIndex === 8 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. AUTOMATED BADGE ENGINE (BadgesController)
                  </div>
                  <p className="text-sm text-[#202124]">
                    Managed by <code>PlatformAdmin</code> via <code>/api/v1/badges</code>. Whenever a new <code>ScoreTransaction</code> is added, the Backend evaluates all <code>Badge</code> definitions by checking <code>CriteriaType</code> and <code>CriteriaValue</code>.
                  </p>
                  <div className="space-y-2 font-code text-xs">
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>Badge Entity:</strong> <code>BadgeID</code>, <code>Name</code>, <code>CriteriaType</code> (e.g. <code>TotalPoints</code>, <code>AttendanceCount</code>), <code>CriteriaValue</code>.
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>StudentBadge Junction Table:</strong> Links <code>StudentID</code> and <code>BadgeID</code> with <code>AwardedAt</code> timestamp as soon as threshold is crossed.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playAchievement();
                      setBadgeUnlockedDemo(true);
                    }}
                    className="retro-btn px-4 py-2 text-xs font-pixel"
                  >
                    ★ Trigger Retro Achievement Unlock
                  </button>
                </div>

                <div className="retro-box-sm p-4 bg-[#f7f7f7] flex flex-col justify-center items-center text-center space-y-3">
                  {badgeUnlockedDemo ? (
                    <div className="p-5 bg-[#202124] text-[#f7f7f7] border-4 border-[#535353] w-full space-y-2">
                      <div className="font-pixel text-xs text-[#cfcfcf]">
                        ★ ACHIEVEMENT UNLOCKED! ★
                      </div>
                      <div className="font-pixel text-base">
                        [BADGE #03: WORKSHOP PIONEER]
                      </div>
                      <p className="font-code text-xs text-[#e0e0e0]">
                        Condition Met: CriteriaType = TotalPoints &gt;= 300. Inserted into StudentBadge &amp; pushed instant Notification!
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 bg-white border-2 border-[#202124] w-full space-y-2">
                      <div className="font-pixel text-xs text-[#535353]">
                        PIXEL BADGE CATALOG PREVIEW
                      </div>
                      <div className="grid grid-cols-3 gap-2 font-code text-xs pt-2">
                        <div className="p-2 border border-[#202124] bg-[#f7f7f7]">
                          <div className="font-bold">[FIRST STEP]</div>
                          <div className="text-[10px] text-[#535353]">100+ TotalPoints</div>
                        </div>
                        <div className="p-2 border border-[#202124] bg-[#f7f7f7]">
                          <div className="font-bold">[PIONEER]</div>
                          <div className="text-[10px] text-[#535353]">300+ TotalPoints</div>
                        </div>
                        <div className="p-2 border border-[#202124] bg-[#f7f7f7]">
                          <div className="font-bold">[TEAM LEADER]</div>
                          <div className="text-[10px] text-[#535353]">Project Created</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 10: NOTIFICATIONS */}
          {checkpointIndex === 9 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. NOTIFICATION SYSTEM & OWNER ACCESS
                  </div>
                  <p className="text-sm text-[#202124]">
                    <code>NotificationsController</code> (<code>/api/v1/notifications</code>) powers the student inbox. Notifications are automatically generated when a student registers for an event, earns attendance points, or unlocks a badge.
                  </p>
                  <div className="space-y-2 font-code text-xs">
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>Read / Unread States:</strong> Tracks <code>IsRead</code> boolean. Supports single mark-as-read and bulk <code>PATCH /api/v1/notifications/mark-all-read</code>.
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>Owner-Based Access Control:</strong> Backend validates JWT <code>StudentID</code> claim against <code>Notification.StudentID</code> so a student can only view, mark read, or delete their own notifications.
                    </div>
                  </div>
                </div>

                {/* Interactive Student Notification Inbox */}
                <div className="lg:col-span-7 retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-pixel text-xs text-[#202124]">
                      02. LIVE STUDENT NOTIFICATION INBOX (Unread: {notifications.filter((n) => !n.isRead).length})
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                      }}
                      className="retro-btn px-3 py-1 text-xs font-code"
                    >
                      PATCH /mark-all-read
                    </button>
                  </div>

                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-2 font-code text-xs flex items-center justify-between gap-3 ${
                          n.isRead
                            ? 'bg-white text-[#535353] border-[#757575]'
                            : 'bg-[#202124] text-[#f7f7f7] border-[#202124]'
                        }`}
                      >
                        <div>
                          <div className="font-bold">
                            {n.isRead ? '[READ]' : '[UNREAD]'} {n.title} ({n.type})
                          </div>
                          <div className="mt-0.5">{n.message}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!n.isRead && (
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                setNotifications((prev) =>
                                  prev.map((item) =>
                                    item.id === n.id ? { ...item, isRead: true } : item
                                  )
                                );
                              }}
                              className="px-2 py-1 bg-[#f7f7f7] text-[#202124] font-bold"
                            >
                              Read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              soundEngine.playClick();
                              setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                            }}
                            className="px-2 py-1 border border-current"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 11: CROSS-MODULE INTEGRATION & FRONTEND SYNERGY */}
          {checkpointIndex === 10 && (
            <div className="space-y-6">
              <div className="retro-box-sm p-4 bg-[#f7f7f7]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. INTERCONNECTED 6-STEP BACKEND BUSINESS WORKFLOW
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playCheckpoint();
                      setCascadeStep((prev) => (prev + 1) % 6);
                    }}
                    className="retro-btn px-3 py-1 text-xs font-code"
                  >
                    Animate Next Cascade Step →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 font-code text-xs">
                  {[
                    { idx: 0, title: '1. Event Creation', sub: 'OrgAdmin posts Workshop & Sessions' },
                    { idx: 1, title: '2. Registration', sub: 'Serializable lock reserves seat' },
                    { idx: 2, title: '3. Attendance', sub: 'QRCode/RFID check-in verified' },
                    { idx: 3, title: '4. Score Ledger', sub: '+100 pts & Level formula updated' },
                    { idx: 4, title: '5. Badge Unlock', sub: 'Criteria met → StudentBadge granted' },
                    { idx: 5, title: '6. Notification', sub: 'Instant alert delivered to Inbox' },
                  ].map((item) => (
                    <div
                      key={item.idx}
                      onClick={() => {
                        soundEngine.playClick();
                        setCascadeStep(item.idx);
                      }}
                      className={`p-3 border-2 cursor-pointer ${
                         item.idx <= cascadeStep
                          ? 'bg-[#202124] text-[#f7f7f7] border-[#202124]'
                          : 'bg-white text-[#535353] border-[#757575]'
                      }`}
                    >
                      <div className="font-bold">{item.title}</div>
                      <div className="text-[11px] mt-1 opacity-90">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frontend Architecture & Visual Identity Alignment (Slides 8, 9, 10) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-2.5">
                  <div className="font-pixel text-xs text-[#202124]">
                    02. FRONTEND ARCHITECTURE & INTERACTIVE ENGINEERING
                  </div>
                  <div className="space-y-2 font-code text-xs">
                    <div className="p-2 bg-white border border-[#202124]">
                      <strong>Morphing Sticky Header & Liquid Gliding Pill:</strong> When <code>scrollY &gt; 90px</code>, the header morphs into a floating capsule with a lime-green <code>T</code> icon and coordinate-calculated gliding pill (<code>offsetLeft</code>, <code>translate3d</code>) across the 5 modules & 26 dropdown actions.
                    </div>
                    <div className="p-2 bg-white border border-[#202124]">
                      <strong>Persistent Email Auth System:</strong> University email sign-up/login with auto-recognition in <code>localStorage</code> and a <code>+100 pts</code> welcome reward.
                    </div>
                    <div className="p-2 bg-white border border-[#202124]">
                      <strong>Typewriter Search & Mouse Spotlight:</strong> Live typewriter search bar with simulated click ripple, Quick Filter Chips, Mouse Spotlight Glow (<code>--mouse-x</code>, <code>--mouse-y</code>), and one-shot Footer Letter Burst animation.
                    </div>
                  </div>
                </div>

                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-2.5">
                  <div className="font-pixel text-xs text-[#202124]">
                    03. FULL-STACK ALIGNMENT & NEXT-PHASE ROADMAP
                  </div>
                  <div className="space-y-2 font-code text-xs">
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>100% Schema-to-UI Parity:</strong> Every menu item in the 5 Main Navigation Modules and 26 Sub-Options maps directly to the 13 Chen ERD tables and the C# .NET 10 API endpoints.
                    </div>
                    <div className="p-2.5 bg-white border border-[#202124]">
                      <strong>Next Phase Roadmap:</strong> Connecting all sub-screens for project creation, Kanban task boards, club recruitment workflows, live camera QR attendance scanning, and the real-time Campus Leaderboard for university launch.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 12: SECURITY & AUTHENTICATION */}
          {checkpointIndex === 11 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    01. AUTHENTICATION VS. AUTHORIZATION
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-code text-xs">
                    <div className="p-3 bg-[#202124] text-[#f7f7f7]">
                      <div className="font-pixel text-[11px] mb-1">AUTHENTICATION</div>
                      <div className="font-bold">&ldquo;Who are you?&rdquo;</div>
                      <p className="mt-1 text-[#cfcfcf]">
                        Verified via university credentials, hashed passwords (<code>PasswordHash</code>), and signed <strong>JWT Bearer Tokens</strong> (<code>[Authorize]</code>).
                      </p>
                    </div>
                    <div className="p-3 bg-white border-2 border-[#202124]">
                      <div className="font-pixel text-[11px] mb-1">AUTHORIZATION</div>
                      <div className="font-bold">&ldquo;What are you allowed to do?&rdquo;</div>
                      <p className="mt-1 text-[#535353]">
                        Enforced via <strong>RBAC Roles</strong> (<code>Student</code>, <code>OrgAdmin</code>, <code>PlatformAdmin</code>) and resource ownership validation.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#202124] text-[#f7f7f7] p-3 font-code text-xs">
                    <div>Authorization: Bearer &lt;JWT_TOKEN_REDACTED&gt;</div>
                    <div className="text-[#cfcfcf] mt-1">
                      Claims: &#123; &quot;sub&quot;: &quot;1084&quot;, &quot;role&quot;: &quot;{activeRole}&quot;, &quot;iss&quot;: &quot;TeamUp.Backend&quot; &#125;
                    </div>
                  </div>
                </div>

                {/* Interactive RBAC Matrix Tester */}
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-3">
                  <div className="font-pixel text-xs text-[#202124]">
                    02. INTERACTIVE RBAC PERMISSION SIMULATOR
                  </div>
                  <div className="flex gap-2 font-code text-xs">
                    {(['Student', 'OrgAdmin', 'PlatformAdmin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveRole(r);
                        }}
                        className={`px-3 py-1.5 font-bold border-2 ${
                          activeRole === r
                            ? 'bg-[#202124] text-[#f7f7f7] border-[#202124]'
                            : 'bg-white text-[#202124] border-[#535353]'
                        }`}
                      >
                        Role: {r}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 font-code text-xs">
                    {[
                      {
                        action: 'POST /api/v1/events/{id}/registrations (Register for Workshop)',
                        allowed: true,
                      },
                      {
                        action: 'PATCH /api/v1/notifications/mark-all-read (Own Inbox Only)',
                        allowed: true,
                      },
                      {
                        action: 'POST /api/v1/events & POST /api/v1/sessions/{id}/attendance',
                        allowed: activeRole === 'OrgAdmin' || activeRole === 'PlatformAdmin',
                      },
                      {
                        action: 'POST /api/v1/badges (Manage University Badge Catalog)',
                        allowed: activeRole === 'PlatformAdmin',
                      },
                    ].map((perm, i) => (
                      <div
                        key={i}
                        className="p-2 bg-white border border-[#202124] flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{perm.action}</span>
                        <span
                          className={`px-2 py-0.5 font-bold shrink-0 ${
                            perm.allowed
                              ? 'bg-[#202124] text-[#f7f7f7]'
                              : 'bg-[#f0f0f0] text-[#535353] line-through'
                          }`}
                        >
                          {perm.allowed ? '200/201 ALLOWED' : '403 FORBIDDEN'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar: Next & Continue Running */}
        <div className="bg-[#f7f7f7] px-6 py-4 border-t-2 border-[#202124] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-code text-[#535353]">
            <span>PRESENTATION FLOW CONTROL</span>
            <span>·</span>
            <span>
              {isLastCheckpoint
                ? 'All 12 Checkpoints Completed! Ready for the Final Boss Challenge.'
                : `Next Up: ${CHECKPOINTS[checkpointIndex + 1].code} — ${CHECKPOINTS[checkpointIndex + 1].title}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextAndResume();
              }}
              className="retro-btn-secondary px-4 py-2.5 font-pixel text-xs whitespace-nowrap"
            >
              {isLastCheckpoint ? 'ENTER BOSS ARENA' : 'CONTINUE RUNNING'}
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextAndResume();
              }}
              className="retro-btn px-5 py-2.5 font-pixel text-xs whitespace-nowrap"
            >
              {isLastCheckpoint ? 'FIGHT FINAL BOSS →' : 'NEXT CHECKPOINT →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
