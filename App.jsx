import {
  BrowserRouter as Router,
  Routes,
  Route,
  // useLocation,
} from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import WhoWeAre from "./Components/AboutUs/WhoAreWe";
import Contact from "./Components/ContactUs";
import WhyUs from "./Components/AboutUs/WhyUs";
import Speech from "./Components/Services/Speech";
import AssessmentEvaluation from "./Components/Services/AssessmentEvaluation";
import FounderMessage from "./Components/AboutUs/FounderImage";
import GoalsSection from "./Components/AboutUs/GoalsSection";
import ResearchDepartment from "./Components/AboutUs/ResearchDepartment";
import BehaviourModification from "./Components/Services/BehaviourModification";
import RemedialTherapy from "./Components/Services/RemedialTherapy";
import OurBranches from "./Components/OurBranches";
import BehaviourTherapy from "./Components/Services/BehaviourTherapy";
import Training from "./Components/Training";
import Services from "./Components/Services/Services";
import FAQ from "./Components/FAQ";
import TermsAndConditions from "./Components/TermsAndConditions";
import OccupationalTherapy from "./Components/Services/Occupational";
import ScrollToTop from "./Components/ScrollTop";
import Photos from "./Components/Media/Photos";
import Videos from "./Components/Media/Videos.jsx";

import ProtectedRoute from "./Components/ProtectedRoute";
import { useDispatch } from "react-redux";
import { login } from "./Components/redux/authSlice";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminAppointment from "./Pages/Admin/AdminAppointment";
import AdminRegister from "./Pages/Admin/AdminRegister";
import AdminViewAppointment from "./Pages/Admin/AdminViewAppointment";
import TherapistDashboard from "./Pages/Therapist/TherapistDashboard";
import DoctorDashBoard from "./Pages/Doctor/DoctorDashBoard";
import IEPDoctor from "./Pages/Doctor/IEPDoctor";
import IEPTherapist from "./Pages/Therapist/IEPTherapist";
import FaceDetection from "./Pages/Therapist/FaceDetection";
import DoctorViewAppointment from "./Pages/Doctor/DoctorViewAppointment";
import ParentDashboard from "./Pages/Parent/ParentDashboard";
import Appointment from "./Pages/Parent/Appointment";
import Register from "./Pages/Register";
import Games from "./Pages/Games";
import ChildDetails from "./Pages/Admin/ChildDetails";
import ChildDetailsParent from "./Pages/Parent/ChildDetailsParent";
import GameReports from "./Pages/Reports";
import IEPReports from "./Pages/Parent/IEPReports";
import AdminIEPReports from "./Pages/Admin/AdminIEPReports";
import JWLEnquiryDetails from "./Pages/Admin/JWLEnquiryDetails";
import Profile from "./Pages/Profile";
import ViewAppointments from "./Pages/Parent/ViewAppointments";
import AdminManageAppointments from "./Pages/Admin/AdminManageAppointments";
import JWLEnquiries from "./Pages/Admin/JWLEnquiries";
import ParentWrapper from "./Pages/Parent/ParentWrapper";
import { Link } from "lucide-react";
import { is } from "date-fns/locale";

const LoginRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = sessionStorage.getItem("role");

  if (isAuthenticated) {
    console.log(isAuthenticated, role);
    switch (role) {
      case "admin":
        return <Navigate to="/admindashboard" replace /> ;
      case "parent":
        return <Navigate to="/parentdashboard" replace /> ;
      case "doctor":
        return <Navigate to="/doctordashboard" replace /> ;
      case "therapist":
        return <Navigate to="/therapistdashboard" replace /> ;
    }
  }
  return <Login />;
};

const AppContent = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus/whoarewe" element={<WhoWeAre />} />
          <Route path="/aboutus/whyus" element={<WhyUs />} />
          <Route path="/aboutus/foundermessages" element={<FounderMessage />} />
          <Route path="/aboutus/goals" element={<GoalsSection />} />
          <Route path="/aboutus/research" element={<ResearchDepartment />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/speech-therapy" element={<Speech />} />
          <Route
            path="/services/assessment-evaluation"
            element={<AssessmentEvaluation />}
          />
          <Route
            path="/services/behaviour-modification"
            element={<BehaviourModification />}
          />
          <Route
            path="/services/occupational-therapy"
            element={<OccupationalTherapy />}
          />
          <Route
            path="/services/remedial-therapy"
            element={<RemedialTherapy />}
          />
          <Route
            path="/services/behaviour-therapy"
            element={<BehaviourTherapy />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ourbranches" element={<OurBranches />} />
          <Route path="/training" element={<Training />} />
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/media/photos" element={<Photos />} />
          <Route path="/media/videos" element={<Videos />} />

          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<Register />} />

          {/* <Route
            path="/parentdashboard"
            element={
              <ProtectedRoute requiredRole={["parent"]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/parentdashboard/bookappointment"
            element={
              <ProtectedRoute requiredRole={["parent"]}>
                <Appointment />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/parentdashboard/viewappointments"
            element={
              <ProtectedRoute requiredRole={["parent"]}>
                <ViewAppointments />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/doctordashboard"
            element={
              <ProtectedRoute requiredRole={["doctor"]}>
                <DoctorDashBoard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctordashboard/iepdoctor"
            element={
              <ProtectedRoute requiredRole={["doctor"]}>
                <IEPDoctor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctordashboard/viewappointment"
            element={
              <ProtectedRoute requiredRole={["doctor"]}>
                <DoctorViewAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard/appointment"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admindashboard/register"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard/jwlenquiries"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <JWLEnquiries />
              </ProtectedRoute>
            }
          />
          <Route path="/parentwrapper" element={<ParentWrapper />} />
          <Route
            path="/admindashboard/jwlenquiries/:referenceId"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <JWLEnquiryDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/therapistdashboard"
            element={
              <ProtectedRoute requiredRole={["therapist"]}>
                <TherapistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/therapistdashboard/iep"
            element={
              <ProtectedRoute requiredRole={["therapist"]}>
                <IEPTherapist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facedetection"
            element={
              <ProtectedRoute requiredRole={["therapist"]}>
                <FaceDetection />
              </ProtectedRoute>
            }
          />
          <Route path="/games" element={<Games />} />
          <Route
            path="/admindashboard/viewappointment"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminViewAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard/child/:childId"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <ChildDetails />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/parentdashboard/child/:childId"
            element={
              <ProtectedRoute requiredRole={["parent"]}>
                <ChildDetailsParent />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/parentdashboard/*"
            element={
              <ProtectedRoute requiredRole={["parent"]}>
                <ParentWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole={["admin", "doctor", "therapist"]}>
                <GameReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/iepreports/:childId"
            element={
              <ProtectedRoute requiredRole={["parent"]}>
                <IEPReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admindashboard/iepreports/:childId"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminIEPReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                requiredRole={["admin", "parent", "doctor", "therapist"]}
              >
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard/manageappointment"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminManageAppointments />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {/* {isPortalPath ? <PortalFooter /> : <Footer />} */}
      <Footer />
    </>
  );
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      dispatch(
        login({ token: token, role: userRole, details: decodedToken.user })
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
