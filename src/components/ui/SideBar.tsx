import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/index.css';
import { ROUTES } from '../../routers/routes';
import { usePermissions } from '../../hooks/usePermissions';

const SideBar: React.FC = () => {
  const location = useLocation();
  const { getMenuPermissions } = usePermissions();
  const permissions = getMenuPermissions();

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        {/* Dashboard - All roles */}
        {permissions.canAccessDashboard && (
          <li className="nav-item">
            <a
              className={`nav-link ${location.pathname === ROUTES.DASHBOARD ? '' : 'collapsed'}`}
              href={ROUTES.DASHBOARD}
            >
              <i className="bi bi-grid"></i>
              <span>Dashboard</span>
            </a>
          </li>
        )}

        {/* Content Management - Admin and Teacher */}
        {(permissions.canAccessEbooks ||
          permissions.canAccessEbookCategories ||
          permissions.canAccessReadings ||
          permissions.canAccessReadingCategories) && (
          <li className="nav-item">
            <a
              className={`nav-link collapsed`}
              data-bs-target="#components-nav"
              data-bs-toggle="collapse"
              href="#"
            >
              <i className="bi bi-menu-button-wide"></i>
              <span>Manage</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="components-nav"
              className={`nav-content collapse ${
                location.pathname.startsWith(ROUTES.EBOOK) ||
                location.pathname.startsWith(ROUTES.EBOOK_CATEGORY) ||
                location.pathname.startsWith(ROUTES.READING) ||
                location.pathname.startsWith(ROUTES.READING_CATEGORY) ||
                location.pathname.startsWith(ROUTES.LEARNING_PATH)
                  ? 'show'
                  : ''
              }`}
              data-bs-parent="#sidebar-nav"
            >
              {permissions.canAccessEbooks && (
                <li>
                  <a
                    href={ROUTES.EBOOK}
                    className={
                      location.pathname === ROUTES.EBOOK ? 'active' : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>E-books</span>
                  </a>
                </li>
              )}
              {permissions.canAccessEbookCategories && (
                <li>
                  <a
                    href={ROUTES.EBOOK_CATEGORY}
                    className={
                      location.pathname === ROUTES.EBOOK_CATEGORY
                        ? 'active'
                        : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>E-book Categories</span>
                  </a>
                </li>
              )}
              {permissions.canAccessReadings && (
                <li>
                  <a
                    href={ROUTES.READING}
                    className={
                      location.pathname === ROUTES.READING ? 'active' : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>Readings</span>
                  </a>
                </li>
              )}
              {permissions.canAccessReadingCategories && (
                <li>
                  <a
                    href={ROUTES.READING_CATEGORY}
                    className={
                      location.pathname === ROUTES.READING_CATEGORY
                        ? 'active'
                        : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>Reading Categories</span>
                  </a>
                </li>
              )}

            {permissions.canAccessLearningPaths && (
              <li>
                <a
                  href={ROUTES.LEARNING_PATH}
                  className={
                    location.pathname === ROUTES.LEARNING_PATH
                      ? 'active'
                      : ''
                  }
                >
                  <i className="bi bi-circle"></i>
                  <span>Learning Paths</span>
                </a>
              </li>
            )}
            </ul>
          </li>
        )}

        {/* User Management - Both Admin and Teacher can view */}
        {(permissions.canAccessUsers ||
          permissions.canAccessStudents ||
          permissions.canAccessTeachers) && (
          <li className="nav-item">
            <a
              className={`nav-link collapsed`}
              data-bs-target="#tables-nav"
              data-bs-toggle="collapse"
              href="#"
            >
              <i className="bi bi-person"></i>
              <span>Users</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="tables-nav"
              className={`nav-content collapse ${
                location.pathname.startsWith(ROUTES.USER) ||
                location.pathname.startsWith(ROUTES.STUDENT) ||
                location.pathname.startsWith(ROUTES.TEACHER)
                  ? 'show'
                  : ''
              }`}
              data-bs-parent="#sidebar-nav"
            >
              {permissions.canAccessUsers && (
                <li>
                  <a
                    href={ROUTES.USER}
                    className={
                      location.pathname === ROUTES.USER ? 'active' : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>Users</span>
                  </a>
                </li>
              )}
              {permissions.canAccessStudents && (
                <li>
                  <a
                    href={ROUTES.STUDENT}
                    className={
                      location.pathname === ROUTES.STUDENT ? 'active' : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>Students</span>
                  </a>
                </li>
              )}
              {/* {permissions.canAccessTeachers && (
                <li>
                  <a
                    href={ROUTES.TEACHER}
                    className={
                      location.pathname === ROUTES.TEACHER ? 'active' : ''
                    }
                  >
                    <i className="bi bi-circle"></i>
                    <span>Teachers</span>
                  </a>
                </li>
              )} */}
            </ul>
          </li>
        )}

        {/* Notifications - Both Admin and Teacher */}
        {permissions.canAccessNotifications && (
          <li className="nav-item">
            <a
              className={`nav-link collapsed`}
              data-bs-target="#components-nav1"
              data-bs-toggle="collapse"
              href="#"
            >
              <i className="bi bi-menu-button-wide"></i>
              <span>Notification</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="components-nav1"
              className={`nav-content collapse ${
                location.pathname.startsWith(`${ROUTES.NOTIFICATION}`)
                  ? 'show'
                  : ''
              }`}
              data-bs-parent="#sidebar-nav"
            >
              <li>
                <a
                  href={ROUTES.NOTIFICATION}
                  className={
                    location.pathname === ROUTES.NOTIFICATION ? 'active' : ''
                  }
                >
                  <i className="bi bi-circle"></i>
                  <span>Manage Notifications</span>
                </a>
              </li>
            </ul>
          </li>
        )}
        {/* Reports - Admin only */}
        {permissions.canAccessReports && (
          <li className="nav-item">
            <a
              className={`nav-link collapsed`}
              data-bs-target="#reports-nav"
              data-bs-toggle="collapse"
              href="#"
            >
              <i className="bi bi-journal-text"></i>
              <span>Reports</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="reports-nav"
              className={`nav-content collapse ${
                location.pathname.startsWith(`${ROUTES.STUDENT_REPORT}`) ||
                location.pathname.startsWith(
                  `${ROUTES.EBOOK_CATEGORY_REPORT}`
                ) ||
                location.pathname.startsWith(
                  `${ROUTES.READING_CATEGORY_REPORT}`
                )
                  ? 'show'
                  : ''
              }`}
              data-bs-parent="#sidebar-nav"
            >
              <li>
                <a
                  href={ROUTES.EBOOK_CATEGORY_REPORT}
                  className={
                    location.pathname === ROUTES.EBOOK_CATEGORY_REPORT
                      ? 'active'
                      : ''
                  }
                >
                  <i className="bi bi-circle"></i>
                  <span>E-book Statistic</span>
                </a>
              </li>
              <li>
                <a
                  href={ROUTES.READING_CATEGORY_REPORT}
                  className={
                    location.pathname === ROUTES.READING_CATEGORY_REPORT
                      ? 'active'
                      : ''
                  }
                >
                  <i className="bi bi-circle"></i>
                  <span>Reading Statistic</span>
                </a>
              </li>
            </ul>
          </li>
        )}

        {/* Feedback Admin - Admin only */}
        {permissions.canAccessFeedbackAdmin && (
          <li className="nav-item">
            <a
              className={`nav-link collapsed`}
              data-bs-target="#feedback-admin-nav"
              data-bs-toggle="collapse"
              href="#"
            >
              <i className="bi bi-chat-square-text"></i>
              <span>Feedback Admin</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="feedback-admin-nav"
              className={`nav-content collapse ${
                location.pathname.startsWith(ROUTES.FEEDBACK_ADMIN)
                  ? 'show'
                  : ''
              }`}
              data-bs-parent="#sidebar-nav"
            >
              <li>
                <a
                  href={ROUTES.FEEDBACK_ADMIN}
                  className={
                    location.pathname === ROUTES.FEEDBACK_ADMIN ? 'active' : ''
                  }
                >
                  <i className="bi bi-circle"></i>
                  <span>Manage Feedback Admin</span>
                </a>
              </li>
            </ul>
          </li>
        )}

        {/* Feedback Teacher - Teacher only */}
        {permissions.canAccessFeedbackTeacher && (
          <li className="nav-item">
            <a
              className={`nav-link collapsed`}
              data-bs-target="#feedback-teacher-nav"
              data-bs-toggle="collapse"
              href="#"
            >
              <i className="bi bi-chat-square-dots"></i>
              <span>Feedback Teacher</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="feedback-teacher-nav"
              className={`nav-content collapse ${
                location.pathname.startsWith(ROUTES.FEEDBACK_TEACHER)
                  ? 'show'
                  : ''
              }`}
              data-bs-parent="#sidebar-nav"
            >
              <li>
                <a
                  href={ROUTES.FEEDBACK_TEACHER}
                  className={
                    location.pathname === ROUTES.FEEDBACK_TEACHER
                      ? 'active'
                      : ''
                  }
                >
                  <i className="bi bi-circle"></i>
                  <span>Manage Feedback Teacher</span>
                </a>
              </li>
            </ul>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default SideBar;
