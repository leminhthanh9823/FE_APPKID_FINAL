import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './routers/routes';
import PrivateRoute, { UserRole } from './routers/PrivateRoute';
import { useLoading } from './hooks/useLoading';
import LoadingScreen from './pages/Loading';
import ConfirmVerifyCode from './pages/ConfirmVerifyCode';
import BasePageLayout from './pages/BasePageLayout';
import User from './pages/User';
import Teacher from './pages/Teacher';
import Forbidden from './pages/Forbidden';
import EBook from './pages/EBook';
import EBookCategory from './pages/EBookCategory';
import EBookCategoryReport from './pages/EBookCategoryReport';
import Reading from './pages/Reading';
import ReadingCategoryReport from './pages/ReadingCategoryReport';
import StudentReport from './pages/StudentReport';
import Dashboard from './pages/Dashboard';
import Question from './pages/Questions';
import EditQuestion from './pages/question/EditQuestion';
import CreateQuestion from './pages/question/CreateQuestion';
import ForgotPassword from './pages/ForgotPassword';
import ProfileEdit from './pages/ProfileEdit';
import Student from './pages/Student';
import StudentDetail from './pages/DetailStudent';
import StudentStatistics from './pages/StudentStatistics';
import Notifications from './pages/notification/Notifications';
import CreateNotification from './pages/notification/CreateNotification';
import EditNotification from './pages/notification/EditNotification';
import ReadingCategory from './pages/ReadingCategory';
import FeedbackAdmin from './pages/feedback/admin/FeedbackAdmin';
import DetailAssignFeedback from './pages/feedback/admin/DetailAssignFeedback';
import FeedbackTeacher from './pages/feedback/teacher/FeedbackTeacher';
import DetailTeacherFeedback from './pages/feedback/teacher/DetailTeacherFeedback';

const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPass = lazy(() => import('./pages/ForgotPass'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPass'));

export function App() {
  const { isLoading } = useLoading();
  return (
    <BrowserRouter>
      {isLoading && <LoadingScreen />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />

          <Route path={ROUTES.FORGOTPASS} element={<ForgotPassword />} />
          <Route path={ROUTES.CHANGEPASS} element={<ForgotPassword />} />
          <Route path={ROUTES.VERIFYCODE} element={<ConfirmVerifyCode />} />
          <Route path={ROUTES.RESETPASS} element={<ResetPassword />} />

          <Route element={<BasePageLayout />}>
            {/* Routes chung cho cả Admin và Teacher */}
            <Route
              element={
                <PrivateRoute
                  allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}
                />
              }
            >
              <Route path={ROUTES.PROFILE} element={<ProfileEdit />} />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.NOTIFICATION} element={<Notifications />} />
              <Route
                path={ROUTES.CREATE_NOTIFICATION}
                element={<CreateNotification />}
              />
              <Route
                path={ROUTES.EDIT_NOTIFICATION}
                element={<EditNotification />}
              />
            </Route>

            {/* Routes chỉ dành cho Admin */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.ADMIN]} />}>
              <Route path={ROUTES.USER} element={<User />} />
              <Route path={ROUTES.STUDENT_REPORT} element={<StudentReport />} />
              <Route
                path={ROUTES.EBOOK_CATEGORY_REPORT}
                element={<EBookCategoryReport />}
              />
              <Route
                path={ROUTES.READING_CATEGORY_REPORT}
                element={<ReadingCategoryReport />}
              />
              <Route path={ROUTES.FEEDBACK_ADMIN} element={<FeedbackAdmin />} />
              <Route
                path={ROUTES.FEEDBACK_ADMIN_DETAIL}
                element={<DetailAssignFeedback />}
              />
            </Route>

            {/* Routes chỉ dành cho Teacher */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.TEACHER]} />}>
              <Route path={ROUTES.EBOOK} element={<EBook />} />
              <Route path={ROUTES.EBOOK_CATEGORY} element={<EBookCategory />} />
              <Route
                path={ROUTES.READING_CATEGORY}
                element={<ReadingCategory />}
              />
              <Route path={ROUTES.READING} element={<Reading />} />
              <Route path={ROUTES.QUESTIONS} element={<Question />} />
              <Route path={ROUTES.EDIT_QUESTION} element={<EditQuestion />} />
              <Route
                path={ROUTES.CREATE_QUESTION}
                element={<CreateQuestion />}
              />
              <Route path={ROUTES.STUDENT} element={<Student />} />
              <Route path={ROUTES.DETAIL_STUDENT} element={<StudentDetail />} />
              <Route
                path={ROUTES.STUDENT_STATISTICS}
                element={<StudentStatistics />}
              />
              <Route path={ROUTES.TEACHER} element={<Teacher />} />
              <Route
                path={ROUTES.FEEDBACK_TEACHER}
                element={<FeedbackTeacher />}
              />
              <Route
                path={ROUTES.FEEDBACK_TEACHER_DETAIL}
                element={<DetailTeacherFeedback />}
              />
            </Route>
          </Route>
          {/* Remove old commented code and add proper protected routes */}
          <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
