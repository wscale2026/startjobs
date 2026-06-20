import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import { useAppDispatch } from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import { fetchPublicSettings } from './store/slices/siteSettingsSlice';
import { fetchLocations } from './store/slices/locationsGlobalSlice';
import { useAppSelector } from './store';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const OfferDetailPage = lazy(() => import('./pages/OfferDetailPage'));
const WizardPage = lazy(() => import('./pages/WizardPage'));
const EmployerOnboardingPage = lazy(() => import('./pages/EmployerOnboardingPage'));
const PostOfferPage = lazy(() => import('./pages/PostOfferPage'));
const RatingPage = lazy(() => import('./pages/RatingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const EmployerDashboardPage = lazy(() => import('./pages/EmployerDashboardPage'));
const CandidateDashboardPage = lazy(() => import('./pages/CandidateDashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminLocationsPage = lazy(() => import('./pages/AdminLocationsPage'));
const AdminProfilePage = lazy(() => import('./pages/AdminProfilePage'));
const AdminOffersPage = lazy(() => import('./pages/AdminOffersPage'));
const AdminSkillsPage = lazy(() => import('./pages/AdminSkillsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage'));
const AdminMailingPage = lazy(() => import('./pages/AdminMailingPage'));

const Loader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

export default function App() {
  const dispatch = useAppDispatch();
  const { site_name, seo_description, seo_keywords } = useAppSelector((state: any) => state.siteSettings);

  useEffect(() => {
    dispatch(fetchPublicSettings());
    dispatch(fetchLocations());
    if (localStorage.getItem('access_token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Apply SEO settings globally
  useEffect(() => {
    if (site_name) document.title = site_name;
    
    if (seo_description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', seo_description);
    }
    
    if (seo_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', seo_keywords);
    }
  }, [site_name, seo_description, seo_keywords]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Standalone landing (no app shell) */}
          <Route path="/" element={<LandingPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
            <Route path="/onboarding/jeune" element={<WizardPage />} />
            <Route path="/onboarding/employeur" element={<EmployerOnboardingPage />} />
            <Route path="/rate/:missionId" element={<RatingPage />} />
          </Route>

          {/* Main app shell */}
          <Route element={<AppLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search/:id" element={<ProfileDetailPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/:id" element={<OfferDetailPage />} />
            <Route path="/post-offer" element={<PostOfferPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
          </Route>

          {/* Admin shell */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/search/:id" element={<ProfileDetailPage />} />
            <Route path="/admin/locations" element={<AdminLocationsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/offers" element={<AdminOffersPage />} />
            <Route path="/admin/skills" element={<AdminSkillsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} />
            <Route path="/admin/mailing" element={<AdminMailingPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
