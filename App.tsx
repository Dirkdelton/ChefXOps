import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

import { ApiContext } from './context/ApiContext.tsx';
import { ProfileContext, Profile as ProfileType } from './context/ProfileContext.tsx';

import { initialLeads, initialEvents } from './data/mockData.ts';

import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Leads from './components/Leads.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import KnowledgeBase from './components/KnowledgeBase.tsx';
import MenuGenerator from './components/MenuGenerator.tsx';
import EventPlanner from './components/EventPlanner.tsx';
import ExportCenter from './components/ExportCenter.tsx';
import Integrations from './components/Integrations.tsx';
import ChefTools from './components/ChefTools.tsx';
import SocialMedia from './components/SocialMedia.tsx';
import Invoicing from './components/Invoicing.tsx';
import Settings from './components/Settings.tsx';
import Profile from './components/Profile.tsx';
import ToastNotification from './components/ToastNotification.tsx';
import { InfoIcon } from './components/icons.tsx';

const App = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [toast, setToast] = useState<{message: string, type: string, id: number} | null>(null);
    
    const [apiConfig, setApiConfig] = useState<{
        apiKey: string | null,
        mapId: string | null,
        ai: GoogleGenAI | null,
        isApiConfigured: boolean
    }>({
        apiKey: null,
        mapId: null,
        ai: null,
        isApiConfigured: false
    });
    
    const PROFILE_KEY = 'chefxops_profile';
    
    const [profile, setProfile] = useState<ProfileType>(() => {
        try {
            const storedProfile = localStorage.getItem(PROFILE_KEY);
            return storedProfile ? JSON.parse(storedProfile) : {
                chefName: "Chef Terry Port",
                businessName: "Elite Chef Events",
                profileImage: "https://picsum.photos/seed/chef/40/40"
            };
        } catch (e) {
            console.error("Failed to parse profile from localStorage", e);
            return { // fallback
                chefName: "Chef Terry Port",
                businessName: "Elite Chef Events",
                profileImage: "https://picsum.photos/seed/chef/40/40"
            };
        }
    });

    const loadApiConfig = () => {
        const apiKey = localStorage.getItem('chefxops_api_key');
        const mapId = localStorage.getItem('chefxops_map_id');
        
        if (apiKey) {
            setApiConfig({
                apiKey,
                mapId,
                ai: new GoogleGenAI({ apiKey }),
                isApiConfigured: true
            });
            loadGoogleMapsScript(apiKey, mapId);
        } else {
             setApiConfig({ apiKey: null, mapId: null, ai: null, isApiConfigured: false });
        }
    };
    
    const loadGoogleMapsScript = (apiKey: string, mapId: string | null) => {
        if (document.getElementById('google-maps-script')) return;

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap${mapId ? `&map_ids=${mapId}`: ''}`;
        script.async = true;
        script.defer = true;
        script.onerror = window.mapApiError;
        document.head.appendChild(script);
    };

    useEffect(() => {
        loadApiConfig();
    }, []);

    useEffect(() => {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }, [profile]);

    const [leads, setLeads] = useState(initialLeads);
    const [events, setEvents] = useState(initialEvents);

    const showToast = (message: string, type = 'success') => {
        setToast({ message, type, id: Date.now() });
    };

    const handleAddLeads = (newLeads: any[]) => {
        const maxId = leads.reduce((max, l) => Math.max(l.id || 0, max), 0);
        const processedLeads = newLeads.map((lead, index) => ({
            ...lead,
            id: maxId + index + 1,
        }));
        setLeads(prevLeads => [...processedLeads, ...prevLeads]);
    };

    const handleAddEvent = (newEvent: any) => {
        setEvents(prevEvents => [{ ...newEvent, id: Date.now() }, ...prevEvents]);
    };
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard leads={leads} events={events} />;
            case 'leads':
                return <Leads leads={leads} onLeadsGenerated={handleAddLeads} showToast={showToast} />;
            case 'ai-assistant':
                return <AIAssistant />;
            case 'knowledge-base':
                return <KnowledgeBase />;
            case 'menu-generator':
                return <MenuGenerator />;
            case 'event-planner':
                return <EventPlanner onEventSaved={handleAddEvent} showToast={showToast} />;
            case 'export-center':
                return <ExportCenter />;
            case 'integrations':
                return <Integrations showToast={showToast} />;
            case 'chef-tools':
                return <ChefTools />;
            case 'social-media':
                return <SocialMedia showToast={showToast} />;
            case 'invoicing':
                return <Invoicing />;
            case 'settings':
                return <Settings showToast={showToast} onApiConfigChange={loadApiConfig} />;
            case 'profile':
                return <Profile showToast={showToast} />;
            default:
                return <Dashboard leads={leads} events={events} />;
        }
    };

    const ApiWarningBanner = () => (
        <div className="bg-red-800/90 text-white p-3 text-center text-sm font-semibold flex items-center justify-center gap-4">
            <InfoIcon />
            API Key not configured. AI and Map features are disabled. Please go to Settings to add your key.
        </div>
    );

    return (
        <ApiContext.Provider value={apiConfig}>
            <ProfileContext.Provider value={{ profile, setProfile }}>
                <div className="flex h-screen text-white">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                    <main className="flex-1 p-8 overflow-y-auto">
                        {/* FIX: Changed `api` to `apiConfig` to correctly reference the state variable. */}
                        {!apiConfig.isConfigured && <ApiWarningBanner />}
                        <div className="fade-in">
                           {renderContent()}
                        </div>
                    </main>
                    {toast && <ToastNotification key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                </div>
            </ProfileContext.Provider>
        </ApiContext.Provider>
    );
};

export default App;