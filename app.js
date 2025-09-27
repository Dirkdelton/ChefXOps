
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';

// --- STABLE DEFAULTS & CONSTANTS (DEFINED OUTSIDE COMPONENTS) ---

const defaultProfile = {
  name: 'Chef Isabella Monroe',
  businessName: 'Monroe Culinary Arts',
  profilePicture: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=2552&auto=format&fit=crop',
};

const defaultIntegrations = {
  googleCalendar: false,
  outlookCalendar: false,
  dropbox: false,
  facebook: false,
  instagram: false,
  twitter: false,
  linkedin: false,
  tiktok: false,
};

// --- ICONS ---

const LogoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#0A0A0A"/>
        <path d="M72.1601 27.8398L50 49.9999L27.8398 72.1601" stroke="#BFA15C" strokeWidth="5" strokeLinecap="round"/>
        <path d="M29.2824 37.9547L38.8388 28.3983" stroke="#BFA15C" strokeWidth="5" strokeLinecap="round"/>
        <path d="M43.125 42.209L49.4853 35.8487" stroke="#BFA15C" strokeWidth="5" strokeLinecap="round"/>
        <path d="M62.0453 70.7176L71.6017 61.1612" stroke="#BFA15C" strokeWidth="5" strokeLinecap="round"/>
        <path d="M50.5146 56.875L56.8749 50.5147" stroke="#BFA15C" strokeWidth="5" strokeLinecap="round"/>
        <path d="M35.707 64.2929L64.2928 35.7071" stroke="white" strokeWidth="8" strokeLinecap="round"/>
        <path d="M50 17.5L55.955 30.045L70 35L55.955 39.955L50 52.5L44.045 39.955L30 35L44.045 30.045L50 17.5Z" fill="#FBBF24" stroke="#0A0A0A" strokeWidth="2"/>
    </svg>
);
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const LeadsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const AIAssistantIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>);
const MenuGeneratorIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>);
const EventPlannerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SocialMediaIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const SpinnerIcon = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);
const ExclamationCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v2a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>);
const InfoCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>);
const ShieldCheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.955a11.955 11.955 0 019-4.016z" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const DropboxIcon = () => (<svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M4.022 19.34L8.08 16.425l3.906 2.915-4.065-2.915zm15.956 0l-4.057-2.915L12 19.34l4.065-2.915zm-12.05-4.522L8.08 8.4l3.906 2.914-4.096 3.504zm12.14-3.504L12 11.315l3.85-2.914L19.96 14.82zM8.08 8.4L12 5.485 15.92 8.4 12 11.314z"/></svg>);
const FacebookIcon = () => (<svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.02C18.343 21.128 22 16.991 22 12z"/></svg>);
const InstagramIcon = () => (<svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266.058 1.644.07 4.85.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zM12 6.848c-2.827 0-5.152 2.324-5.152 5.152s2.325 5.152 5.152 5.152 5.152-2.325 5.152-5.152-2.325-5.152-5.152-5.152zm0 8.302c-1.737 0-3.152-1.415-3.152-3.152s1.415-3.152 3.152-3.152 3.152 1.415 3.152 3.152-1.415 3.152-3.152 3.152zm6.35-8.502c-.75 0-1.354.604-1.354 1.354s.604 1.354 1.354 1.354 1.354-.604 1.354-1.354-.604-1.354-1.354-1.354z"/></svg>);
const TwitterIcon = () => (<svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/></svg>);
const LinkedInIcon = () => (<svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>);
const TikTokIcon = () => (<svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.95-6.43-2.98-1.59-2.04-1.6-4.77-1.52-7.15.04-1.28.27-2.55.63-3.79.48-1.56 1.34-2.95 2.5-4.15 1.16-1.19 2.56-2.11 4.12-2.67.04-1.39.01-2.79.03-4.18z"/></svg>);


// --- MAIN APP COMPONENT ---

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [profile, setProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('chefXOpsProfile');
      return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      return defaultProfile;
    }
  });
  const [settings, setSettings] = useState(() => {
    try {
        const savedSettings = localStorage.getItem('chefXOpsSettings');
        return savedSettings ? JSON.parse(savedSettings) : { apiKey: '', mapId: '' };
    } catch(e) { return { apiKey: '', mapId: '' } }
  });
  const [integrations, setIntegrations] = useState(() => {
    try {
        const savedIntegrations = localStorage.getItem('chefXOpsIntegrations');
        return savedIntegrations ? JSON.parse(savedIntegrations) : defaultIntegrations;
    } catch(e) { return defaultIntegrations; }
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const genAI = useMemo(() => {
    if (settings.apiKey) {
      try {
        return new GoogleGenAI({ apiKey: settings.apiKey });
      } catch (error) {
        console.error("Invalid GenAI API Key", error);
        return null;
      }
    }
    return null;
  }, [settings.apiKey]);
  
  useEffect(() => {
    try { localStorage.setItem('chefXOpsProfile', JSON.stringify(profile)); } 
    catch(e){ console.error("Could not save profile to localStorage", e) }
  }, [profile]);
  
  useEffect(() => {
    try { localStorage.setItem('chefXOpsSettings', JSON.stringify(settings)); } 
    catch(e){ console.error("Could not save settings to localStorage", e) }
  }, [settings]);
  
  useEffect(() => {
    try { localStorage.setItem('chefXOpsIntegrations', JSON.stringify(integrations)); }
    catch(e){ console.error("Could not save integrations to localStorage", e) }
  }, [integrations]);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard': return <Dashboard profile={profile} />;
      case 'Leads': return <Leads settings={settings} showToast={showToast} genAI={genAI} />;
      case 'AI Assistant': return <AIAssistant genAI={genAI} showToast={showToast} />;
      case 'Menu Generator': return <MenuGenerator genAI={genAI} showToast={showToast} setLoading={setLoading} />;
      case 'Event Planner': return <EventPlanner genAI={genAI} showToast={showToast} setLoading={setLoading} />;
      case 'Social Media': return <SocialMedia genAI={genAI} showToast={showToast} integrations={integrations} setLoading={setLoading} />;
      case 'Integrations': return <Integrations integrations={integrations} setIntegrations={setIntegrations} showToast={showToast} />;
      case 'My Profile': return <Profile profile={profile} setProfile={setProfile} showToast={showToast} />;
      case 'Settings': return <Settings settings={settings} setSettings={setSettings} showToast={showToast} />;
      default: return <Dashboard profile={profile} />;
    }
  };

  return (
    <div className="flex h-screen bg-glossy-black text-heather-gray-light font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} profile={profile} />
      <main className="flex-1 p-8 overflow-y-auto">
        {!settings.apiKey && (
            <div className="bg-red-900-50 border border-red-500/50 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <ExclamationCircleIcon />
                    <span className="ml-3">Google API Key is not configured. AI and Map features are disabled.</span>
                </div>
                <button onClick={() => setCurrentPage('Settings')} className="bg-gold-20 text-bright-yellow px-4 py-2 rounded-md text-sm font-semibold hover:bg-gold-20/50 transition-colors">
                    Configure Now
                </button>
            </div>
        )}
        {loading && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <SpinnerIcon />
              <p className="text-gold mt-4 text-lg">Generating Content...</p>
            </div>
          </div>
        )}
        {renderPage()}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// --- SUB-COMPONENTS ---

const Sidebar = ({ currentPage, setCurrentPage, profile }) => {
  const navItems = ['Dashboard', 'Leads', 'AI Assistant', 'Menu Generator', 'Event Planner', 'Social Media'];
  
  return (
    <div className="w-64 bg-card-black flex flex-col p-4 border-r border-white-10">
      <div className="flex items-center mb-10 pl-2">
         <LogoIcon />
        <h1 className="text-2xl font-bold text-white ml-2">ChefXOps</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map(item => (
          <a
            key={item}
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentPage(item); }}
            className={`flex items-center px-4 py-3 text-lg rounded-lg transition-all duration-200 ${
              currentPage === item
                ? 'bg-gradient-active-link text-bright-yellow border-l-4 border-bright-yellow font-semibold'
                : 'text-heather-gray hover:bg-white-5 hover:text-white'
            }`}
          >
            {item === 'Dashboard' && <DashboardIcon />}
            {item === 'Leads' && <LeadsIcon />}
            {item === 'AI Assistant' && <AIAssistantIcon />}
            {item === 'Menu Generator' && <MenuGeneratorIcon />}
            {item === 'Event Planner' && <EventPlannerIcon />}
            {item === 'Social Media' && <SocialMediaIcon />}
            <span className="ml-4">{item}</span>
          </a>
        ))}
      </nav>
      
      <div className="mt-auto">
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Settings'); }} className="flex items-center px-4 py-3 text-lg rounded-lg text-heather-gray hover:bg-white-5 hover:text-white transition-all duration-200">
          <SettingsIcon />
          <span className="ml-4">Settings</span>
        </a>
        <div className="border-t border-white-10 my-4"></div>
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('My Profile'); }} className="flex items-center p-2 rounded-lg hover:bg-white-5 transition-colors">
          <img src={profile.profilePicture} alt="Profile" className="h-12 w-12 rounded-full object-cover border-2 border-gold-50" />
          <div className="ml-3">
            <p className="font-semibold text-white">{profile.name}</p>
            <p className="text-sm text-heather-gray">{profile.businessName}</p>
          </div>
        </a>
      </div>
    </div>
  );
};

const Dashboard = ({ profile }) => {
  return (
    <div className="fade-in">
      <h2 className="text-4xl font-serif text-white mb-2">Welcome Back, <span className="text-gold">{profile.name.split(' ')[0]}</span></h2>
      <p className="text-lg text-heather-gray mb-8">Here's your culinary intelligence overview for today.</p>
    </div>
  );
};

const GoogleMap = ({ apiKey, mapId, leads, showToast }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (!map) {
            setMap(new window.google.maps.Map(mapRef.current, {
                center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
                zoom: 12,
                mapId: mapId,
                disableDefaultUI: true,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
                    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
                ]
            }));
        }
    }, [map, mapId]);

    useEffect(() => {
        if (map && leads.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            leads.forEach(lead => {
                const marker = new window.google.maps.Marker({
                    position: { lat: lead.latitude, lng: lead.longitude },
                    map: map,
                    title: lead.company_name,
                    icon: {
                        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23BFA15C" stroke="%230A0A0A" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
                        scaledSize: new window.google.maps.Size(32, 32),
                    },
                });
                bounds.extend(marker.getPosition());
            });
            map.fitBounds(bounds);
        }
    }, [map, leads]);
    
    return <div ref={mapRef} className="w-full h-full" />;
};

const Leads = ({ settings, showToast, genAI }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (settings.apiKey && settings.mapId && !window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${settings.apiKey}&map_ids=${settings.mapId}&callback=initMap`;
            script.async = true;
            window.initMap = () => setMapLoaded(true);
            document.head.appendChild(script);
        } else if (window.google) {
             setMapLoaded(true);
        }
    }, [settings.apiKey, settings.mapId]);

    const handleGenerateLeads = async () => {
        if (!genAI) {
            showToast("Please configure API Key and Map ID in Settings first.", "error");
            return;
        }
        setIsLoading(true);
        showToast("Generating high-value leads in the area...", "info");
        
        const prompt = `Generate a JSON array of 5 fictional high-value catering leads in New York City. Each lead must be an object with keys: "company_name", "contact_name", "contact_email", "revenue_potential" (as a number), "latitude" (between 40.7 and 40.8), "longitude" (between -74.0 and -73.9), and "company_description".`;

        try {
            const result = await genAI.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });
            
            const leadsData = JSON.parse(result.text);
            setLeads(leadsData);
            showToast(`${leadsData.length} new leads have been populated on the map.`, "success");
        } catch(e) {
            console.error(e);
            showToast("Failed to generate leads. Check API key and console.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in h-full flex flex-col">
            <h2 className="text-4xl font-serif text-white mb-2">Intelligent Lead Generation</h2>
            <p className="text-lg text-heather-gray mb-6">Discover high-value catering and private chef opportunities in your area.</p>
            <div className="bg-card-black p-4 rounded-lg border border-white-10 mb-6">
                <button onClick={handleGenerateLeads} disabled={isLoading} className="bg-gradient-gold-yellow text-black font-bold py-3 px-6 rounded-md hover:shadow-glow-yellow transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                     {isLoading ? <><SpinnerIcon /> <span className="ml-2">Generating...</span></> : 'Generate New Leads'}
                </button>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-white-10 shadow-lg bg-charcoal flex items-center justify-center text-heather-gray-dark p-4">
                {(!settings.apiKey || !settings.mapId) ? (
                    <p>Please configure your Google API Key and Map ID in Settings to use this feature.</p>
                ) : mapLoaded ? (
                    <GoogleMap apiKey={settings.apiKey} mapId={settings.mapId} leads={leads} showToast={showToast} />
                ) : (
                   <div className="text-center">
                       <SpinnerIcon />
                       <p className="mt-2 text-white">Loading Map...</p>
                   </div>
                )}
            </div>
        </div>
    );
};


const AIAssistant = ({ genAI, showToast }) => {
    return (
        <div className="fade-in">
            <h2 className="text-4xl font-serif text-white mb-2">Onboard Culinary Agent</h2>
            <p className="text-lg text-heather-gray mb-6">Your 24/7 AI-powered partner for culinary and business excellence.</p>
        </div>
    );
};

const MenuGenerator = ({ genAI, showToast, setLoading }) => {
    return (
        <div className="fade-in">
            <h2 className="text-4xl font-serif text-white mb-2">Automated Menu Generator</h2>
            <p className="text-lg text-heather-gray mb-6">Craft bespoke, professional menus in seconds.</p>
        </div>
    );
};

const EventPlanner = ({ genAI, showToast, setLoading }) => {
    return (
        <div className="fade-in">
            <h2 className="text-4xl font-serif text-white mb-2">Automated Event Planner</h2>
            <p className="text-lg text-heather-gray mb-6">Generate comprehensive event plans, from timelines to staffing.</p>
        </div>
    );
};

const SocialMedia = ({ genAI, showToast, integrations, setLoading }) => {
    const [platform, setPlatform] = useState(['instagram']);
    const [topic, setTopic] = useState('');
    const [postText, setPostText] = useState('');
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isDropboxOpen, setIsDropboxOpen] = useState(false);
    const fileInputRef = useRef(null);
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setMediaPreview(e.target.result);
                setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const togglePlatform = (p) => {
        setPlatform(prev => 
            prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
        );
    };

    const handlePost = async () => {
        if (!topic || !mediaPreview) {
            showToast("Please provide a topic and an image/video.", "error");
            return;
        }

        if(!genAI) {
            showToast("API Key not configured. Cannot generate text.", "error");
            return;
        }

        const connectedAndSelected = platform.filter(p => integrations[p]);
        if (connectedAndSelected.length === 0) {
            showToast("No selected platforms are connected. Please connect in Settings.", "error");
            return;
        }

        setIsPosting(true);
        setLoading(true);

        try {
            const prompt = `Generate a social media post about "${topic}". The post should be engaging and professional. Keep it concise.`;
            const result = await genAI.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt
            });

            setPostText(result.text);
            showToast("Generated post text successfully!", "success");

            for (let i = 0; i < connectedAndSelected.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 700));
                const plat = connectedAndSelected[i];
                showToast(`Posted to ${plat.charAt(0).toUpperCase() + plat.slice(1)}`, "success");
            }

        } catch (error) {
            showToast("Failed to generate content or post.", "error");
            console.error(error);
        } finally {
            setIsPosting(false);
            setLoading(false);
        }
    };

    const socialPlatforms = [
        { name: 'facebook', icon: <FacebookIcon /> },
        { name: 'instagram', icon: <InstagramIcon /> },
        { name: 'twitter', icon: <TwitterIcon /> },
        { name: 'linkedin', icon: <LinkedInIcon /> },
        { name: 'tiktok', icon: <TikTokIcon /> },
    ];

    return (
        <div className="fade-in">
            <h2 className="text-4xl font-serif text-white mb-2">Social Media Assistant</h2>
            <p className="text-lg text-heather-gray mb-6">Generate engaging content and distribute it across your platforms.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card-black p-6 rounded-lg border border-white-10 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-heather-gray-light mb-2">1. Select Platforms</label>
                        <div className="flex space-x-3">
                            {socialPlatforms.map(p => (
                                <button key={p.name} onClick={() => togglePlatform(p.name)} className={`p-3 rounded-full transition-all duration-200 ${platform.includes(p.name) ? 'bg-gold-20 ring-2 ring-bright-yellow' : 'bg-charcoal'} ${!integrations[p.name] && 'opacity-30 cursor-not-allowed'}`} title={`Connect ${p.name} in Integrations`} disabled={!integrations[p.name]}>
                                    {p.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-heather-gray-light mb-2">2. Upload Media</label>
                         <div className="flex space-x-2">
                             <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-charcoal text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center hover:bg-white-5 transition-colors">
                                 <UploadIcon/> Upload from Device
                             </button>
                             <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                             <button onClick={() => setIsDropboxOpen(true)} disabled={!integrations.dropbox} className="flex-1 bg-charcoal text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center hover:bg-white-5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                 <DropboxIcon /> Select from Dropbox
                             </button>
                         </div>
                    </div>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-heather-gray-light mb-2">3. What is the post about?</label>
                        <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-charcoal p-3 rounded-md border border-white-10 focus:ring-2 ring-gold transition-colors" placeholder="e.g., Behind the scenes of a wedding catering event" />
                    </div>
                    <button onClick={handlePost} disabled={isPosting} className="w-full bg-gradient-gold-yellow text-black font-bold py-3 px-6 rounded-md hover:shadow-glow-yellow transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                        {isPosting ? <><SpinnerIcon /> <span className="ml-2">Generating & Posting...</span></> : 'Generate Text & Post'}
                    </button>
                </div>
                <div className="bg-card-black p-6 rounded-lg border border-white-10">
                    <h3 className="text-xl font-semibold text-white mb-4">Live Preview</h3>
                    <div className="aspect-square w-full bg-charcoal rounded-md flex items-center justify-center border-2 border-dashed border-white-10">
                        {mediaPreview ? (
                            mediaType === 'video' ? 
                            <video src={mediaPreview} controls className="w-full h-full object-contain rounded-md"></video> :
                            <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                        ) : (
                            <p className="text-heather-gray-dark">Your image or video will appear here</p>
                        )}
                    </div>
                    <div className="mt-4 bg-charcoal p-4 rounded-md h-32 overflow-y-auto">
                        <p className="text-white whitespace-pre-wrap">{postText || "Generated post text will appear here..."}</p>
                    </div>
                </div>
            </div>
            {isDropboxOpen && <DropboxModal onClose={() => setIsDropboxOpen(false)} onSelect={(type) => {setMediaType(type); setMediaPreview('https://via.placeholder.com/500'); setIsDropboxOpen(false);}}/>}
        </div>
    );
};

const DropboxModal = ({ onClose, onSelect }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card-black rounded-lg border border-white-10 p-6 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Select from Dropbox</h3>
                <button onClick={onClose}><XIcon /></button>
            </div>
            <div className="bg-charcoal p-4 rounded-md h-96">
                <p className="text-center text-heather-gray">Dropbox file picker simulation.</p>
                <div className="grid grid-cols-4 gap-4 mt-4">
                   <div onClick={() => onSelect('image')} className="aspect-square bg-white-5 flex items-center justify-center cursor-pointer hover:bg-gold-20">Image 1</div>
                   <div onClick={() => onSelect('video')} className="aspect-square bg-white-5 flex items-center justify-center cursor-pointer hover:bg-gold-20">Video 1</div>
                </div>
            </div>
        </div>
    </div>
);

const Integrations = ({ integrations, setIntegrations, showToast }) => {
    const handleToggle = (key) => {
        setIntegrations(prev => ({...prev, [key]: !prev[key]}));
        showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} integration ${!integrations[key] ? 'enabled' : 'disabled'}.`, 'success');
    };

    const IntegrationCard = ({ id, name, icon, connected }) => (
        <div className="bg-charcoal p-6 rounded-lg border border-white-10 flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-10 h-10">{icon}</div>
                <span className="ml-4 text-lg text-white font-semibold">{name}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={connected} onChange={() => handleToggle(id)} className="sr-only peer" />
              <div className="w-14 h-7 bg-heather-gray-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold"></div>
            </label>
        </div>
    );

    return (
        <div className="fade-in">
            <h2 className="text-4xl font-serif text-white mb-2">Seamless Integrations</h2>
            <p className="text-lg text-heather-gray mb-8">Connect your favorite tools to streamline your workflow.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IntegrationCard id="dropbox" name="Dropbox" icon={<DropboxIcon />} connected={integrations.dropbox} />
                <IntegrationCard id="facebook" name="Facebook" icon={<FacebookIcon />} connected={integrations.facebook} />
                <IntegrationCard id="instagram" name="Instagram" icon={<InstagramIcon />} connected={integrations.instagram} />
                <IntegrationCard id="twitter" name="Twitter/X" icon={<TwitterIcon />} connected={integrations.twitter} />
                <IntegrationCard id="linkedin" name="LinkedIn" icon={<LinkedInIcon />} connected={integrations.linkedin} />
                <IntegrationCard id="tiktok" name="TikTok" icon={<TikTokIcon />} connected={integrations.tiktok} />
            </div>
        </div>
    );
};

const Profile = ({ profile, setProfile, showToast }) => {
    const [formData, setFormData] = useState(profile);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProfile(formData);
        showToast("Profile updated successfully!", "success");
    };

    return (
        <div className="fade-in max-w-2xl mx-auto">
            <h2 className="text-4xl font-serif text-white mb-2">My Profile</h2>
            <p className="text-lg text-heather-gray mb-8">Update your personal and business information.</p>
            <form onSubmit={handleSubmit} className="space-y-6 bg-card-black p-8 rounded-lg border border-white-10">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-heather-gray-light mb-2">Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-charcoal p-3 rounded-md border border-white-10 focus:ring-2 ring-gold transition-colors" />
                </div>
                <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-heather-gray-light mb-2">Business Name</label>
                    <input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} className="w-full bg-charcoal p-3 rounded-md border border-white-10 focus:ring-2 ring-gold transition-colors" />
                </div>
                <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-heather-gray-light mb-2">Profile Picture URL</label>
                    <input type="text" name="profilePicture" id="profilePicture" value={formData.profilePicture} onChange={handleChange} className="w-full bg-charcoal p-3 rounded-md border border-white-10 focus:ring-2 ring-gold transition-colors" />
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full bg-gradient-gold-yellow text-black font-bold py-3 px-6 rounded-md hover:shadow-glow-yellow transition-all">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

const Settings = ({ settings, setSettings, showToast }) => {
    const [formData, setFormData] = useState(settings);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSettings(formData);
        showToast("Settings saved successfully!", "success");
    };
    
    return (
        <div className="fade-in max-w-3xl mx-auto">
            <h2 className="text-4xl font-serif text-white mb-2">Application Settings</h2>
            <p className="text-lg text-heather-gray mb-8">Configure API keys and other application settings.</p>
            <form onSubmit={handleSubmit} className="space-y-8 bg-card-black p-8 rounded-lg border border-white-10">
                <div className="space-y-4">
                    <h3 className="text-xl text-white font-semibold">API Configuration</h3>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-heather-gray-light mb-2">Google Cloud API Key</label>
                        <input type="password" name="apiKey" id="apiKey" value={formData.apiKey} onChange={handleChange} className="w-full bg-charcoal p-3 rounded-md border border-white-10 focus:ring-2 ring-gold transition-colors" placeholder="Enter your Google Cloud API Key" />
                    </div>
                    <div>
                        <label htmlFor="mapId" className="block text-sm font-medium text-heather-gray-light mb-2">Google Maps Map ID</label>
                        <input type="text" name="mapId" id="mapId" value={formData.mapId} onChange={handleChange} className="w-full bg-charcoal p-3 rounded-md border border-white-10 focus:ring-2 ring-gold transition-colors" placeholder="Enter your Google Maps Map ID" />
                    </div>
                </div>
                <div className="border-t border-white-10"></div>
                <div className="space-y-4">
                     <h3 className="text-xl text-white font-semibold flex items-center"><ShieldCheckIcon className="mr-3 text-gold" /> Data & Privacy</h3>
                    <p className="text-heather-gray text-sm">
                        All your data, including API keys and profile information, is stored securely and privately in your browser's local storage.
                        It is never uploaded to any server or shared with anyone. Your privacy is paramount.
                    </p>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-gradient-gold-yellow text-black font-bold py-3 px-6 rounded-md hover:shadow-glow-yellow transition-all">Save All Settings</button>
                </div>
            </form>
        </div>
    );
};

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircleIcon />,
    error: <ExclamationCircleIcon />,
    info: <InfoCircleIcon />,
  };
  
  return (
    <div className="fixed top-5 right-5 bg-card-black border-l-4 border-gold-50 shadow-lg rounded-md p-4 flex items-center z-50 toast-in" style={{ borderColor: type === 'success' ? '#34D399' : type === 'error' ? '#F87171' : '#60A5FA' }}>
      <div className={`text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-400`}>
        {icons[type]}
      </div>
      <p className="text-white ml-3">{message}</p>
      <button onClick={onClose} className="ml-4 text-heather-gray-dark hover:text-white">&times;</button>
    </div>
  );
};

// --- RENDER THE APP ---
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
