
import React, { useState, useEffect, useMemo, useRef, Suspense, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- API Configuration ---
const ApiContext = createContext({ ai: null, apiKey: null, isApiConfigured: false });
const ProfileContext = createContext(null);
// --- END API Configuration ---


// --- START: From types.js ---
const ServiceType = {
  CATERING: 'Catering',
  PRIVATE_CHEF: 'Private Chef',
  CONSULTING: 'Consulting',
  COOKING_CLASS: 'Cooking Class',
};

const ClientType = {
  CORPORATE: 'Corporate',
  WEDDING: 'Wedding',
  PRIVATE_PARTY: 'Private Party',
  WINERY: 'Winery',
  RESTAURANT: 'Restaurant',
};
// --- END: From types.js ---

// --- START: From data/mockData.js ---
const initialLeads = [
    { id: 1, businessName: 'Innovate Corp', serviceType: 'Catering', clientType: 'Corporate', estCovers: 150, revenuePotential: 12000, contactName: 'Jane Doe', contactEmail: 'jane@innovate.com', status: 'Proposal Sent', lat: 49.8880, lng: -119.4960, address: '123 Innovation Dr, Kelowna, BC' },
    { id: 2, businessName: 'The Orchard Winery', serviceType: 'Private Chef', clientType: 'Winery', estCovers: 20, revenuePotential: 4500, contactName: 'John Smith', contactEmail: 'john@orchard.com', status: 'Contacted', lat: 49.9010, lng: -119.5100, address: '456 Vineyard Rd, Kelowna, BC' },
    { id: 3, businessName: 'Lakeside Wedding Venue', serviceType: 'Catering', clientType: 'Wedding', estCovers: 120, revenuePotential: 15000, contactName: 'Emily White', contactEmail: 'emily@lakeside.com', status: 'Closed', lat: 49.8750, lng: -119.4850, address: '789 Waterfront Ave, Kelowna, BC' },
    { id: 4, businessName: 'Tech Growth Conference', serviceType: 'Catering', clientType: 'Corporate', estCovers: 500, revenuePotential: 40000, contactName: 'Michael Brown', contactEmail: 'mbrown@techconf.com', status: 'New', lat: 49.8800, lng: -119.4900, address: '101 Tech Hub, Kelowna, BC' },
];

const initialEvents = [
  { id: 1, name: 'Johnson Wedding', date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), guests: 120 },
  { id: 2, name: 'Innovate Corp Gala', date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(), guests: 150 },
  { id: 3, name: 'Winery Tasting Event', date: new Date(new Date().setDate(new Date().getDate() + 40)).toISOString(), guests: 50 },
];

const cookbooks = [
  { id: 1, title: 'The Flavor Bible', author: 'Karen Page & Andrew Dornenburg', tags: ['pairing', 'reference', 'modern'], coverImageUrl: 'https://picsum.photos/seed/flavorbible/200/300' },
  { id: 2, title: 'Salt, Fat, Acid, Heat', author: 'Samin Nosrat', tags: ['technique', 'fundamentals', 'science'], coverImageUrl: 'https://picsum.photos/seed/saltfat/200/300' },
  { id: 3, title: 'On Food and Cooking', author: 'Harold McGee', tags: ['science', 'reference', 'chemistry'], coverImageUrl: 'https://picsum.photos/seed/onfood/200/300' },
  { id: 4, title: 'The Professional Chef', author: 'CIA', tags: ['professional', 'technique', 'classic'], coverImageUrl: 'https://picsum.photos/seed/prochef/200/300' },
  { id: 5, title: 'Modernist Cuisine at Home', author: 'Nathan Myhrold', tags: ['modernist', 'sous-vide', 'science'], coverImageUrl: 'https://picsum.photos/seed/modernist/200/300' },
  { id: 6, title: 'Mastering the Art of French Cooking', author: 'Julia Child', tags: ['french', 'classic', 'technique'], coverImageUrl: 'https://picsum.photos/seed/frenchcooking/200/300' },
];
// --- END: From data/mockData.js ---

// --- START: From components/icons.js ---
const DashboardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LeadsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const AiAssistantIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 16.663c.527-1.352 1.055-2.701 1.582-4.05M14.337 16.663c-.527-1.352-1.055-2.701-1.582-4.05M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a6 6 0 006-6H6a6 6 0 006 6z" />
  </svg>
);

const KnowledgeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EventIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ExportIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SendIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" {...props}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const IntegrationIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const RevenueIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5A6.5 6.5 0 1012 5.5a6.5 6.5 0 000 13z" />
    </svg>
);

const LeadsIconSolid = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);

const EventsIconSolid = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const UserIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const ChefToolsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h.01M9 15h.01M12 15h.01M15 15h.01M12 11h.01M15 11h.01M12 7h.01M15 7h.01M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
  </svg>
);

const RightArrowIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const PlusIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
  
const TrashIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const ClockIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
);

const ChevronDownIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const SocialMediaIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 1 1-12.728 0 9 9 0 0 1 12.728 0z" />
    </svg>
);

const FacebookIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/>
    </svg>
);

const InstagramIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/>
    </svg>
);

const TwitterIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.218 3.803 4.655-.667.18-1.372.247-2.083.185.616 1.954 2.398 3.281 4.512 3.32-.975.76-2.203 1.216-3.544 1.216-.228 0-.453-.013-.676-.038 1.264.813 2.766 1.286 4.38 1.286 5.257 0 8.142-4.368 8.142-8.142 0-.123-.003-.246-.008-.368.558-.401 1.042-.903 1.428-1.482z"/>
    </svg>
);

const LinkedInIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.98v16h4.98v-8.399c0-2.002.396-3.998 2.983-3.998s2.503 1.801 2.503 3.998v8.4h4.98v-10.396c0-5.522-2.99-8.106-6.66-8.106-3.33 0-4.825 1.777-5.668 3.362h.022v-2.863z"/>
    </svg>
);

const RegenerateIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10M20 20l-1.5-1.5A9 9 0 003.5 14" />
    </svg>
);

const InvoicingIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h.01M12 17h.01" />
    </svg>
);

const SaveIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 16 6.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16.5v-13Z" />
        <path d="M5.25 2.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75h-5.5ZM6 4h4v1H6V4Z" />
    </svg>
);

const OutlookIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12,11.8L2.4,5.4C2.2,5.2,2,5.3,2,5.6v12.8C2,19.1,2.9,20,4,20h16c1.1,0,2-0.9,2-2V5.6c0-0.3-0.2-0.4-0.4-0.2L12,11.8z M12,13l10-6.8V5.2c0-1-0.7-1.8-1.7-2L12,10L3.7,3.2C2.7,2.6,2,3.4,2,4.4v0.8L12,13z" />
    </svg>
);

const OneDriveIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" {...props}>
         <path d="M5.5,6.5 C3.3,6.5 1.5,8.3 1.5,10.5 C1.5,12.7 3.3,14.5 5.5,14.5 C7.7,14.5 9.5,12.7 9.5,10.5 C9.5,8.3 7.7,6.5 5.5,6.5 Z M18.5,9.5 C16.3,9.5 14.5,11.3 14.5,13.5 C14.5,15.7 16.3,17.5 18.5,17.5 C20.7,17.5 22.5,15.7 22.5,13.5 C22.5,11.3 20.7,9.5 18.5,9.5 Z M10,12.5 C8.3,12.5 7,13.8 7,15.5 C7,17.2 8.3,18.5 10,18.5 L14,18.5 C15.7,18.5 17,17.2 17,15.5 C17,13.8 15.7,12.5 14,12.5 L10,12.5 Z" />
    </svg>
);

const DropboxIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 4L4 9l8 5 8-5-8-5zm0 6.5L4 15l8 5 8-5-8-5z"/>
    </svg>
);

const GCalendarIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21,3H3C1.9,3,1,3.9,1,5v14c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V5C23,3.9,22.1,3,21,3z M8,21H3V10h5V21z M15,21h-5V10h5V21z M21,21h-5V10h5V21z M21,8H3V5h18V8z"/>
        <rect x="5" y="12" width="2" height="2"/>
        <rect x="11" y="12" width="2" height="2"/>
        <rect x="17" y="12" width="2" height="2"/>
    </svg>
);

const CheckCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9.25 12.19l-1.47-1.47a.75.75 0 0 0-1.06 1.06L8.19 13.25l-1.47 1.47a.75.75 0 1 0 1.06 1.06L9.25 14.31l1.47 1.47a.75.75 0 1 0 1.06-1.06L10.31 13.25l1.47-1.47a.75.75 0 0 0-1.06-1.06L9.25 12.19Z" clipRule="evenodd" />
    </svg>
);


const MicrophoneIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" {...props}>
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10a1 1 0 0 0-1 1v1a6 6 0 0 1-12 0v-1a1 1 0 1 0-2 0v1a8 8 0 0 0 7 7.93V21a1 1 0 1 0 2 0v-2.07A8 8 0 0 0 20 12v-1a1 1 0 0 0-1-1Z" />
    </svg>
);

const SpeakerIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" {...props}>
        <path d="M5.25 8.375a.75.75 0 0 0-1.5 0v7.25a.75.75 0 0 0 1.5 0V8.375Z" />
        <path d="M8.25 5.375a.75.75 0 0 0-1.5 0v13.25a.75.75 0 0 0 1.5 0V5.375Z" />
        <path d="M11.25 3.375a.75.75 0 0 0-1.5 0v17.25a.75.75 0 0 0 1.5 0V3.375Z" />
        <path d="M14.25 5.375a.75.75 0 0 0-1.5 0v13.25a.75.75 0 0 0 1.5 0V5.375Z" />
        <path d="M17.25 8.375a.75.75 0 0 0-1.5 0v7.25a.75.75 0 0 0 1.5 0V8.375Z" />
    </svg>
);

const SettingsIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- END: From components/icons.js ---

// --- START: From services/geminiService.js ---

const safeApiCall = async (action, ai) => {
    if (!ai) {
        throw new Error("AI client is not initialized. Please configure the API key in Settings.");
    }
    try {
        const response = await action(ai);
        return response.text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        const message = e.message ? e.message.split('] ')[1] || e.message : 'An unexpected error occurred with the AI service.';
        throw new Error(`AI Error: ${message}`);
    }
};

const geocodeAddress = async (address, apiKey) => {
    try {
        if (!apiKey) {
            console.error("API_KEY for geocoding is not set.");
            return null;
        }
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`);
        
        if (!response.ok) {
            console.warn(`Geocoding API request failed for address "${address}" with status ${response.status}`);
            return null;
        }
        
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].geometry.location; // Returns { lat, lng }
        } else {
            console.warn(`Geocoding failed for address "${address}": ${data.status}`);
            return null;
        }
    } catch (error) {
        console.error("Geocoding fetch error:", error);
        return null;
    }
};

const generateLeads = (ai, location, clientType, serviceType) => {
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                businessName: { type: Type.STRING },
                address: { type: Type.STRING },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                revenuePotential: { type: Type.INTEGER },
                contactName: { type: Type.STRING },
                status: { type: Type.STRING },
                serviceType: { type: Type.STRING },
                clientType: { type: Type.STRING },
                contactEmail: { type: Type.STRING },
            },
            required: ["businessName", "address", "lat", "lng", "revenuePotential", "contactName", "status", "serviceType", "clientType", "contactEmail"]
        },
    };
    return safeApiCall((ai) => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find 5 potential high-value business leads for a professional chef offering ${serviceType} services to ${clientType} clients in ${location}. For each lead, provide a realistic business name, a plausible local address with approximate latitude/longitude, a potential contact person's name, a valid-looking but fake email, an estimated revenue potential, and set the status to "New". Ensure the response is a clean JSON array of objects.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    }), ai);
};

const getAIResponse = (ai, prompt, systemInstruction) => {
    return safeApiCall((ai) => {
        const config = {};
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        } else {
            config.systemInstruction = "You are a master chef and marketing expert for the culinary industry. Provide concise, professional, and actionable advice.";
        }
        return ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: config
        });
    }, ai);
};

const extractSearchTerm = (ai, text) => {
    return safeApiCall((ai) => {
        return ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following user request, extract the most relevant and concise search term for a culinary knowledge base. Return only the search term itself, with no extra text or quotes. For example, if the user asks "how to make a hollandaise sauce", you should return "hollandaise sauce". User request: "${text}"`,
        });
    }, ai);
};

const generateMenu = (ai, serviceType, clientType, covers, dietaryRestrictions, cuisine) => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            menuTitle: { type: Type.STRING },
            appetizer: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
            mainCourse: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
            dessert: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
        },
        required: ["menuTitle", "appetizer", "mainCourse", "dessert"]
    };
    const restrictions = dietaryRestrictions.length > 0 ? `It must accommodate the following restrictions: ${dietaryRestrictions.join(', ')}.` : '';
    return safeApiCall((ai) => {
      return ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a professional three-course menu (appetizer, main, dessert) for a ${serviceType} event for a ${clientType} client. The event has ${covers} covers. The preferred cuisine is ${cuisine || 'Modern American'}. ${restrictions} Provide a creative title for the menu.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
      });
    }, ai);
};

const generateEventPlan = (ai, details) => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            eventName: { type: Type.STRING },
            theme: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } },
            menu: {
                type: Type.OBJECT, properties: {
                    appetizer: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
                    mainCourse: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
                    dessert: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
                }
            },
            staffing: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role: { type: Type.STRING }, count: { type: Type.INTEGER }, notes: { type: Type.STRING } } } },
            timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timeFrame: { type: Type.STRING }, tasks: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
        },
        required: ["eventName", "theme", "menu", "staffing", "timeline"]
    };
    return safeApiCall((ai) => {
        return ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a comprehensive event plan for the following event. Provide a creative theme, a three-course menu, a staffing plan (chefs, servers, etc.), and a detailed prep timeline (e.g., '1 Week Out', '3 Days Out', 'Day Of'). Event Details: ${JSON.stringify(details)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
    }, ai);
};

const generateImageFromPrompt = async (ai, prompt) => {
    if (!ai) {
        throw new Error("AI client is not initialized. Please configure the API key in Settings.");
    }
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Professional food photography, culinary, hyper-realistic, high detail: ${prompt}`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });
        if (!response.generatedImages || response.generatedImages.length === 0) {
           throw new Error("Image generation failed to return an image. The prompt may have been blocked.");
        }
        return response.generatedImages[0].image.imageBytes;
    } catch (e) {
        console.error("Image Generation API Error:", e);
        throw new Error("The AI image generator is currently unavailable or the prompt was blocked. Please try again later.");
    }
};
// --- END: From services/geminiService.js ---


// --- START: Component: PageHeader ---
const PageHeader = ({title, subtitle}) => {
    const { profile } = useContext(ProfileContext);
    return (
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-4xl font-serif font-bold text-white mb-1">{title}</h1>
                <p className="text-heather-gray">{subtitle}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <h2 className="text-3xl font-bold text-white tracking-wide">{profile.businessName}</h2>
                <p className="text-3xl font-script text-gold -mt-1">{profile.chefName}</p>
            </div>
        </div>
    );
};
// --- END: Component: PageHeader ---

// --- START: Component: Spinner ---
const Spinner = ({text = "Loading..."}) => (
    <div className="flex flex-col items-center justify-center p-8 text-heather-gray">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="mt-2 text-sm font-semibold">{text}</span>
    </div>
);
// --- END: Component: Spinner ---

// --- START: Component: ToastNotification ---
const ToastNotification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-600/90' : 'bg-red-600/90';
    const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
    const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

    return (
        <div className={`fixed top-8 right-8 z-50 toast-in`}>
            <div className={`flex items-center p-4 rounded-lg shadow-2xl border ${borderColor} ${bgColor} text-white max-w-sm backdrop-blur-sm`}>
                <Icon className={`w-6 h-6 mr-3 ${isSuccess ? 'text-white' : 'text-white'}`} />
                <span className="font-semibold">{message}</span>
                <button onClick={onClose} className="ml-4 text-white/70 hover:text-white">&times;</button>
            </div>
        </div>
    );
};
// --- END: Component: ToastNotification ---

// --- START: From components/RevenueChart.js ---
const RevenueChart = () => {
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 8000 },
  ];
  return (
    <>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{fill: 'rgba(191, 161, 92, 0.1)'}}
            contentStyle={{ backgroundColor: '#111214', border: '1px solid rgba(255,255,255,0.2)' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#F3F4F6', fontSize: '12px' }} />
          <Bar dataKey="revenue" fill="url(#colorRevenue)" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#BFA15C" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};
// --- END: From components/RevenueChart.js ---

// --- START: From components/Dashboard.js ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-card-black border-2 border-dashed border-red-700/50 rounded-lg p-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-red-400">Component Error</h3>
                <p className="text-sm text-heather-gray mt-1">There was an issue loading this component.</p>
            </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const StatCard = ({ title, value, subtext, icon }) => (
  <div className="bg-card-black p-6 rounded-lg border border-white/10 shadow-lg relative overflow-hidden group transition-all duration-300 ease-in-out hover:border-gold hover:shadow-glow-gold hover:-translate-y-1">
    <div className="absolute -right-8 -bottom-8 text-white/5 opacity-80 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300 ease-in-out">
      {icon}
    </div>
    <h3 className="text-sm font-medium text-heather-gray">{title}</h3>
    <p className="text-4xl font-bold text-gold mt-2">{value}</p>
    <p className="text-xs text-heather-gray-dark mt-1">{subtext}</p>
  </div>
);

const StatusPill = ({ status }) => {
    const statusClasses = {
        'New': 'bg-heather-gray/20 text-heather-gray-light',
        'Contacted': 'bg-bright-yellow/20 text-bright-yellow',
        'Proposal Sent': 'bg-gold/20 text-gold',
        'Closed': 'bg-green-500/20 text-green-400',
    };
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
    return <span className={`${baseClasses} ${statusClasses[status] || ''}`}>{status}</span>;
}

const Dashboard = ({ leads, events }) => {
  const totalRevenue = leads.filter(l => l.status === 'Closed').reduce((sum, lead) => sum + lead.revenuePotential, 0);
  const activeLeadsCount = leads.filter(l => l.status !== 'Closed').length;
  const upcomingEventsCount = events.length;
  const upcomingEvents = [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
  const recentLeads = [...leads].sort((a,b) => b.id - a.id).slice(0, 4);
  const leadFunnel = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back. Here's your business at a glance." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Revenue (Closed)" value={`$${totalRevenue.toLocaleString()}`} subtext="All-time closed deals" icon={<RevenueIcon className="w-28 h-28" />} />
        <StatCard title="Active Leads" value={activeLeadsCount.toString()} subtext="In pipeline" icon={<LeadsIconSolid className="w-28 h-28" />} />
        <StatCard title="Upcoming Events" value={upcomingEventsCount.toString()} subtext="Scheduled and confirmed" icon={<EventsIconSolid className="w-28 h-28" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-card-black p-6 rounded-lg border border-white/10 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Monthly Revenue Overview</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ErrorBoundary>
              <RevenueChart />
            </ErrorBoundary>
          </div>
        </div>
        <div className="lg:col-span-2 bg-card-black p-6 rounded-lg border border-white/10 shadow-lg flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4">Activity Feed</h2>
            <div className="flex-1 space-y-4 overflow-y-auto">
                <div>
                    <h3 className="text-sm font-semibold text-heather-gray mb-2">UPCOMING EVENTS</h3>
                    <ul className="space-y-2">
                        {upcomingEvents.map(event => (
                            <li key={event.id} className="flex items-center space-x-3 text-sm p-2 rounded-md transition-colors hover:bg-white/[.03]">
                                <div className="p-2 bg-charcoal rounded-md"><EventIcon className="w-5 h-5 text-gold"/></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-200">{event.name}</p>
                                    <p className="text-xs text-heather-gray">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <p className="text-xs text-heather-gray">{event.guests} guests</p>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-semibold text-heather-gray mb-2">RECENT LEADS</h3>
                     <ul className="space-y-2">
                        {recentLeads.map(lead => (
                            <li key={lead.id} className="flex items-center justify-between text-sm p-2 rounded-md transition-colors hover:bg-white/[.03]">
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold text-gray-200 truncate">{lead.businessName}</p>
                                    <p className="text-xs text-heather-gray">${lead.revenuePotential.toLocaleString()}</p>

                                </div>
                                <StatusPill status={lead.status} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>
      <div className="bg-card-black p-6 rounded-lg border border-white/10 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Lead Conversion Funnel</h2>
        <div className="flex flex-col md:flex-row items-center justify-around space-y-4 md:space-y-0 md:space-x-4">
            <div className="text-center">
                <p className="text-3xl font-bold text-heather-gray">{leadFunnel['New'] || 0}</p>
                <p className="text-sm font-semibold text-heather-gray-dark">New</p>
            </div>
            <RightArrowIcon className="text-gray-600 hidden md:block" />
            <div className="text-center">
                <p className="text-3xl font-bold text-bright-yellow">{leadFunnel['Contacted'] || 0}</p>
                <p className="text-sm font-semibold text-heather-gray-dark">Contacted</p>
            </div>
            <RightArrowIcon className="text-gray-600 hidden md:block" />
            <div className="text-center">
                <p className="text-3xl font-bold text-gold">{leadFunnel['Proposal Sent'] || 0}</p>
                <p className="text-sm font-semibold text-heather-gray-dark">Proposal Sent</p>
            </div>
            <RightArrowIcon className="text-gray-600 hidden md:block" />
            <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{leadFunnel['Closed'] || 0}</p>
                <p className="text-sm font-semibold text-heather-gray-dark">Closed</p>
            </div>
        </div>
      </div>
    </div>
  );
};
// --- END: From components/Dashboard.js ---

// --- START: From components/Leads.js ---
const Leads = ({ leads, onLeadsGenerated, showToast }) => {
    const { ai, apiKey, isApiConfigured } = useContext(ApiContext);
    const [location, setLocation] = useState('Kelowna, BC');
    const [clientType, setClientType] = useState(ClientType.CORPORATE);
    const [serviceType, setServiceType] = useState(ServiceType.CATERING);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [error, setError] = useState('');
    const [mapError, setMapError] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const markersRef = useRef([]);

    // Effect for initializing the map
    useEffect(() => {
        const initializeMap = async () => {
            if (!isApiConfigured) {
                setMapError("Please configure your Google API Key in the Settings page to use the map feature.");
                return;
            }
            
            try {
                await window.mapApiLoaded; 
            
                if (mapContainer.current && !map) {
                    const mapInstance = new window.google.maps.Map(mapContainer.current, {
                        center: { lat: 49.8880, lng: -119.4960 },
                        zoom: 12,
                        mapId: localStorage.getItem('chefxops_map_id') || '',
                        disableDefaultUI: true,
                    });
                    setMap(mapInstance);
                }
            } catch (e) {
                console.error("Error initializing Google Map:", e);
                setMapError("Failed to initialize Google Maps. The API key or Map ID may be invalid.");
            }
        };
        
        initializeMap();

    }, [map, isApiConfigured]);


    // Effect for updating markers
    useEffect(() => {
        if (map && window.google) {
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            leads.forEach(lead => {
                if (typeof lead.lat === 'number' && typeof lead.lng === 'number') {
                    const marker = new window.google.maps.Marker({
                        position: { lat: lead.lat, lng: lead.lng },
                        map: map,
                        title: lead.businessName,
                    });

                    marker.addListener('click', () => {
                        setSelectedLead(lead);
                    });
                    
                    markersRef.current.push(marker);
                }
            });
        }
    }, [leads, map]);

    const handleGenerateLeads = async () => {
        setIsLoading(true);
        setIsGeocoding(false);
        setError('');
        try {
            const resultsText = await generateLeads(ai, location, clientType, serviceType);
            const results = JSON.parse(resultsText);
            
            setIsGeocoding(true);
            const geocodedLeads = await Promise.all(results.map(async (lead) => {
                const coordinates = await geocodeAddress(lead.address, apiKey);
                return {
                    ...lead,
                    lat: coordinates ? coordinates.lat : lead.lat,
                    lng: coordinates ? coordinates.lng : lead.lng,
                };
            }));
            
            onLeadsGenerated(geocodedLeads);
            showToast(`${geocodedLeads.length} new leads generated and mapped!`, 'success');
        } catch (e) {
            setError(e.message);
            showToast(e.message, 'error');
        } finally {
            setIsLoading(false);
            setIsGeocoding(false);
        }
    };
    
    return (
        <div>
            <PageHeader title="Lead Generation" subtitle="AI-powered engine to discover new business opportunities." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card-black p-6 rounded-lg border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Lead Criteria</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-heather-gray" htmlFor="location">Location</label>
                                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-heather-gray" htmlFor="clientType">Client Type</label>
                                <select id="clientType" value={clientType} onChange={e => setClientType(e.target.value)} className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold">
                                    {Object.values(ClientType).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-heather-gray" htmlFor="serviceType">Service Type</label>
                                <select id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold">
                                    {Object.values(ServiceType).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGenerateLeads} disabled={isLoading || !isApiConfigured} className="w-full mt-6 bg-gradient-to-r from-gold to-bright-yellow text-glossy-black font-bold py-3 px-4 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Generate Leads'}
                        </button>
                    </div>
                    {selectedLead && (
                         <div className="bg-card-black p-6 rounded-lg border border-gold/50 shadow-glow-gold fade-in">
                            <h3 className="text-lg font-bold text-gold mb-2">{selectedLead.businessName}</h3>
                            <p className="text-sm text-heather-gray">{selectedLead.address}</p>
                            <div className="border-t border-white/10 my-4"></div>
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-heather-gray-light">Contact:</strong> {selectedLead.contactName}</p>
                                <p><strong className="text-heather-gray-light">Potential:</strong> ${selectedLead.revenuePotential.toLocaleString()}</p>
                                <div className="flex items-center justify-between">
                                    <strong className="text-heather-gray-light">Status:</strong>
                                    <StatusPill status={selectedLead.status} />
                                </div>
                            </div>
                         </div>
                    )}
                </div>
                <div className="lg:col-span-2 bg-card-black rounded-lg border border-white/10 h-[60vh] overflow-hidden flex items-center justify-center">
                    {isLoading ? <Spinner text={isGeocoding ? 'Verifying locations...' : 'Generating leads with AI...'} /> :
                     mapError ? <div className="text-center p-4"><p className="text-red-400 font-semibold">{mapError}</p></div> :
                     <div ref={mapContainer} className="w-full h-full"></div>
                    }
                </div>
            </div>
        </div>
    );
};
// --- END: From components/Leads.js ---

// --- START: From components/AIAssistant.js ---
const AIAssistant = () => {
    const { ai, isApiConfigured } = useContext(ApiContext);
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError('');
        
        try {
            const responseText = await getAIResponse(ai, input);
            const aiMessage = { role: 'ai', text: responseText };
            setHistory(prev => [...prev, aiMessage]);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <PageHeader title="Onboard Culinary Agent" subtitle="Your AI partner for culinary expertise and business strategy." />
            <div className="bg-card-black rounded-lg border border-white/10 shadow-lg h-[75vh] flex flex-col">
                <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0"><AiAssistantIcon className="w-5 h-5 text-gold"/></div>}
                             <div className={`max-w-xl p-4 rounded-lg ${msg.role === 'user' ? 'bg-charcoal text-white' : 'bg-glossy-black text-heather-gray-light'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                             </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0"><AiAssistantIcon className="w-5 h-5 text-gold"/></div>
                            <div className="max-w-xl p-4 rounded-lg bg-glossy-black">
                                <Spinner text="Thinking..." />
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about pairings, marketing, or business plans..."
                            className="flex-1 bg-charcoal border border-white/10 rounded-lg p-3 text-white placeholder-heather-gray-dark focus:outline-none focus:ring-2 focus:ring-gold"
                            disabled={isLoading || !isApiConfigured}
                        />
                        <button type="submit" disabled={isLoading || !isApiConfigured} className="bg-gold text-glossy-black rounded-lg p-3 disabled:opacity-50">
                            <SendIcon />
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};
// --- END: From components/AIAssistant.js ---

// --- START: From components/KnowledgeBase.js ---
const KnowledgeBase = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCookbooks, setFilteredCookbooks] = useState(cookbooks);
    
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term === '') {
            setFilteredCookbooks(cookbooks);
            return;
        }
        const lowerTerm = term.toLowerCase();
        const filtered = cookbooks.filter(
            book => book.title.toLowerCase().includes(lowerTerm) ||
                    book.author.toLowerCase().includes(lowerTerm) ||
                    book.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
        );
        setFilteredCookbooks(filtered);
    };

    return (
        <div>
            <PageHeader title="Knowledge Base" subtitle="Access your digital library of culinary wisdom." />
            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search for a technique, ingredient, or book title..."
                    className="w-full bg-card-black border border-white/10 rounded-lg p-4 text-white placeholder-heather-gray-dark focus:outline-none focus:ring-2 focus:ring-gold"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {filteredCookbooks.map(book => (
                    <div key={book.id} className="bg-card-black rounded-lg border border-white/10 p-4 text-center group transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-gold">
                        <img src={book.coverImageUrl} alt={book.title} className="w-full h-auto rounded-md shadow-lg mb-4 aspect-[2/3] object-cover" />
                        <h3 className="font-semibold text-white text-sm">{book.title}</h3>
                        <p className="text-xs text-heather-gray">{book.author}</p>
                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                            {book.tags.map(tag => (
                                <span key={tag} className="text-xs bg-charcoal px-2 py-0.5 rounded-full text-heather-gray-dark">{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
// --- END: From components/KnowledgeBase.js ---

// --- START: From components/MenuGenerator.js ---
const MenuGenerator = () => {
  const { ai, isApiConfigured } = useContext(ApiContext);
  const [serviceType, setServiceType] = useState(ServiceType.CATERING);
  const [clientType, setClientType] = useState(ClientType.CORPORATE);
  const [covers, setCovers] = useState('50');
  const [dietary, setDietary] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [menu, setMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setMenu(null);
    try {
      const response = await generateMenu(ai, serviceType, clientType, covers, dietary.split(',').map(s=>s.trim()), cuisine);
      setMenu(JSON.parse(response));
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const MenuCard = ({ title, course }) => (
    <div className="bg-charcoal p-6 rounded-lg border border-white/10">
        <h4 className="text-sm font-semibold text-gold tracking-widest uppercase mb-2">{title}</h4>
        <h3 className="text-xl font-semibold text-white mb-1">{course.name}</h3>
        <p className="text-heather-gray text-sm">{course.description}</p>
    </div>
  );

  return (
    <div>
      <PageHeader title="Menu Generator" subtitle="Craft bespoke menus with AI assistance." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-card-black p-6 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Menu Parameters</h3>
          <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-heather-gray" htmlFor="mg-serviceType">Service Type</label>
                <select id="mg-serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold">
                    {Object.values(ServiceType).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-heather-gray" htmlFor="mg-clientType">Client Type</label>
                <select id="mg-clientType" value={clientType} onChange={e => setClientType(e.target.value)} className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold">
                    {Object.values(ClientType).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-heather-gray" htmlFor="mg-covers">Est. Covers</label>
                <input id="mg-covers" type="number" value={covers} onChange={e => setCovers(e.target.value)} className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
             <div>
                <label className="text-sm font-medium text-heather-gray" htmlFor="mg-cuisine">Cuisine Style (optional)</label>
                <input id="mg-cuisine" type="text" value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="e.g., Italian, Pacific Northwest" className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
             <div>
                <label className="text-sm font-medium text-heather-gray" htmlFor="mg-dietary">Dietary Restrictions (optional)</label>
                <input id="mg-dietary" type="text" value={dietary} onChange={e => setDietary(e.target.value)} placeholder="e.g., gluten-free, vegan" className="w-full bg-charcoal border border-white/10 rounded-md p-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <button onClick={handleGenerate} disabled={isLoading || !isApiConfigured} className="w-full mt-2 bg-gradient-to-r from-gold to-bright-yellow text-glossy-black font-bold py-3 px-4 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? 'Generating...' : 'Generate Menu'}
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
            {isLoading && <div className="bg-card-black p-6 rounded-lg border border-white/10 h-full flex items-center justify-center"><Spinner text="Crafting your menu..."/></div>}
            {error && <div className="bg-red-900/50 p-6 rounded-lg text-red-300 border border-red-700">{error}</div>}
            {menu && (
                <div className="bg-card-black p-6 rounded-lg border border-white/10 fade-in">
                    <h2 className="text-3xl font-serif font-bold text-white text-center mb-2">{menu.menuTitle}</h2>
                    <div className="border-b-2 border-gold w-24 mx-auto mb-6"></div>
                    <div className="space-y-4">
                       <MenuCard title="Appetizer" course={menu.appetizer} />
                       <MenuCard title="Main Course" course={menu.mainCourse} />
                       <MenuCard title="Dessert" course={menu.dessert} />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
// --- END: From components/MenuGenerator.js ---

// --- START: From components/EventPlanner.js ---
const EventPlanner = ({ onEventSaved, showToast }) => {
    const { ai, isApiConfigured } = useContext(ApiContext);
    const [formDetails, setFormDetails] = useState({
        eventName: '',
        clientName: '',
        guestCount: '50',
        eventDate: new Date().toISOString().split('T')[0],
        budget: '10000',
        notes: ''
    });
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] =useState(false);
    const [error, setError] = useState('');
    const [eventSaved, setEventSaved] = useState(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormDetails(prev => ({...prev, [id]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setPlan(null);
        setEventSaved(false);
        try {
            const responseText = await generateEventPlan(ai, formDetails);
            setPlan(JSON.parse(responseText));
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveEvent = () => {
        if (!plan) return;
        const newEvent = {
            name: plan.eventName,
            date: new Date(formDetails.eventDate).toISOString(),
            guests: parseInt(formDetails.guestCount, 10),
        };
        onEventSaved(newEvent);
        setEventSaved(true);
        showToast('Event plan saved to dashboard!', 'success');
    };

    return (
        <div>
            <PageHeader title="Event Planning" subtitle="Generate comprehensive event plans from basic details." />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-card-black p-6 rounded-lg border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
                    <div className="space-y-4">
                        <input id="eventName" value={formDetails.eventName} onChange={handleInputChange} placeholder="Event Name (e.g., Smith Wedding)" className="w-full bg-charcoal border border-white/10 rounded-md p-2 text-white" />
                        <input id="clientName" value={formDetails.clientName} onChange={handleInputChange} placeholder="Client Name" className="w-full bg-charcoal border border-white/10 rounded-md p-2 text-white" />
                        <input id="guestCount" type="number" value={formDetails.guestCount} onChange={handleInputChange} placeholder="Guest Count" className="w-full bg-charcoal border border-white/10 rounded-md p-2 text-white" />
                        <input id="eventDate" type="date" value={formDetails.eventDate} onChange={handleInputChange} className="w-full bg-charcoal border border-white/10 rounded-md p-2 text-white" />
                        <textarea id="notes" value={formDetails.notes} onChange={handleInputChange} placeholder="Additional Notes (e.g., allergies, preferences)" rows="3" className="w-full bg-charcoal border border-white/10 rounded-md p-2 text-white"></textarea>
                         <button onClick={handleGenerate} disabled={isLoading || !isApiConfigured} className="w-full mt-2 bg-gradient-to-r from-gold to-bright-yellow text-glossy-black font-bold py-3 px-4 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isLoading ? 'Generating Plan...' : 'Generate AI Event Plan'}
                        </button>
                    </div>
                </div>
                <div className="md:col-span-2">
                    {isLoading && <div className="bg-card-black p-6 rounded-lg border border-white/10 h-full flex items-center justify-center"><Spinner text="Building your event plan..."/></div>}
                    {error && <div className="bg-red-900/50 p-6 rounded-lg text-red-300 border border-red-700">{error}</div>}
                    {plan && (
                        <div className="bg-card-black p-6 rounded-lg border border-white/10 fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">{plan.eventName}</h2>
                            <div className="mb-6 p-4 bg-charcoal rounded-md border-l-4 border-gold">
                                <h3 className="font-semibold text-gold">{plan.theme.title}</h3>
                                <p className="text-sm text-heather-gray-light">{plan.theme.description}</p>
                            </div>
                            
                            { /* Staffing & Timeline Sections could be added here for full display */ }
                            
                            <div className="mt-6 text-right">
                               <button onClick={handleSaveEvent} disabled={eventSaved} className="flex items-center gap-2 bg-gold text-glossy-black font-bold py-2 px-4 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-green-600 disabled:text-white">
                                   <SaveIcon />
                                   {eventSaved ? 'Saved!' : 'Save Event Plan'}
                               </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
// --- END: From components/EventPlanner.js ---

// --- START: From components/ExportCenter.js ---
const ExportCenter = () => (
    <div>
        <PageHeader title="Export Center" subtitle="Download your data in various formats." />
        <div className="bg-card-black p-6 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Leads', 'Events', 'Menus', 'Invoices'].map(item => (
                    <div key={item} className="bg-charcoal p-4 rounded-md border border-white/10 text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">{item} Data</h3>
                        <div className="flex justify-center space-x-2">
                            <button className="bg-gold/20 text-gold font-semibold py-2 px-4 rounded-md text-sm hover:bg-gold hover:text-black transition-colors">CSV</button>
                            <button className="bg-gold/20 text-gold font-semibold py-2 px-4 rounded-md text-sm hover:bg-gold hover:text-black transition-colors">PDF</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
// --- END: From components/ExportCenter.js ---

// --- START: From components/Integrations.js ---
const IntegrationCard = ({ icon, name, description, onConnect }) => {
    const [isConnected, setIsConnected] = useState(false);
    const handleConnect = () => {
        setIsConnected(!isConnected);
        onConnect(name, !isConnected);
    };

    return (
        <div className="bg-charcoal p-4 rounded-lg border border-white/10 flex items-center space-x-4">
            <div className="text-gold">{icon}</div>
            <div className="flex-1">
                <h3 className="font-semibold text-white">{name}</h3>
                <p className="text-xs text-heather-gray">{description}</p>
            </div>
            <button
                onClick={handleConnect}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    isConnected
                        ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                        : 'bg-gold/20 text-gold hover:bg-gold hover:text-black'
                }`}
            >
                {isConnected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
};

const Integrations = ({showToast}) => {
    const handleConnect = (name, connected) => {
        showToast(`${name} has been ${connected ? 'connected' : 'disconnected'}.`, 'success');
    };

    const integrationList = [
        { icon: <GCalendarIcon />, name: "Google Calendar", description: "Sync events and bookings." },
        { icon: <OutlookIcon />, name: "Outlook Calendar", description: "Sync with your Microsoft calendar." },
        { icon: <OneDriveIcon />, name: "OneDrive", description: "Access documents from OneDrive." },
        { icon: <DropboxIcon />, name: "Dropbox", description: "Link and manage files from Dropbox." },
    ];

    return (
        <div>
            <PageHeader title="Integrations" subtitle="Connect ChefXOps with your favorite tools." />
             <div className="bg-card-black p-6 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Available Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrationList.map(item => (
                        <IntegrationCard key={item.name} {...item} onConnect={handleConnect} />
                    ))}
                </div>
            </div>
        </div>
    );
};
// --- END: From components/Integrations.js ---

// --- START: From components/ChefTools.js ---
const ChefTools = () => {
  const tools = [
    { name: "Unit Converter", description: "Convert between metric and imperial units.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    { name: "Costing Calculator", description: "Calculate food cost percentage for menu items.", icon: <RevenueIcon className="h-6 w-6" /> },
    { name: "Scaling Tool", description: "Scale recipes up or down for different yields.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5" /></svg> },
    { name: "Inventory Tracker", description: "Keep track of stock levels and ingredients.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
  ];
  return (
    <div>
      <PageHeader title="Chef Tools" subtitle="A suite of utilities to streamline your kitchen operations." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(tool => (
          <div key={tool.name} className="bg-card-black p-6 rounded-lg border border-white/10 hover:border-gold transition-colors">
            <div className="flex items-center space-x-4">
              <div className="text-gold">{tool.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                <p className="text-sm text-heather-gray">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- END: From components/ChefTools.js ---

// --- START: From components/SocialMedia.js ---
const SocialMedia = ({showToast}) => {
    const { ai, isApiConfigured } = useContext(ApiContext);
    const [platform, setPlatform] = useState('Instagram');
    const [topic, setTopic] = useState('');
    const [post, setPost] = useState(null);
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError] = useState('');
    
    const platforms = [
        { name: 'Instagram', icon: <InstagramIcon />},
        { name: 'Facebook', icon: <FacebookIcon /> },
        { name: 'Twitter', icon: <TwitterIcon /> },
        { name: 'LinkedIn', icon: <LinkedInIcon /> },
    ];

    const handleGeneratePost = async () => {
        if (!topic) return;
        setIsLoading(true);
        setError('');
        setPost(null);
        setImageUrl('');
        try {
            const prompt = `Create a compelling social media post for ${platform} about "${topic}". The post should be engaging, professional, and tailored for a culinary business. Include relevant hashtags. Also, provide a short, vivid prompt for an AI image generator to create a stunning accompanying photo, formatted as "Image Prompt: [prompt here]".`;
            const responseText = await getAIResponse(ai, prompt);
            const imagePromptRegex = /Image Prompt: (.*)/;
            const match = responseText.match(imagePromptRegex);
            
            if (match) {
                const extractedPrompt = match[1];
                const postText = responseText.replace(imagePromptRegex, '').trim();
                setPost(postText);
                setImagePrompt(extractedPrompt);
                handleGenerateImage(extractedPrompt);
            } else {
                setPost(responseText);
                setImagePrompt('');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateImage = async (promptToUse) => {
        setIsImageLoading(true);
        try {
            const imageData = await generateImageFromPrompt(ai, promptToUse);
            setImageUrl(`data:image/jpeg;base64,${imageData}`);
        } catch (e) {
            setError(e.message || "Failed to generate image.");
        } finally {
            setIsImageLoading(false);
        }
    };

    return (
        <div>
            <PageHeader title="Social Media Assistant" subtitle="Generate engaging posts and images for your brand." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card-black p-6 rounded-lg border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Post Details</h3>
                        <div>
                            <label className="text-sm font-medium text-heather-gray">Platform</label>
                            <div className="flex space-x-2 mt-2">
                                {platforms.map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => setPlatform(p.name)}
                                        className={`flex-1 p-2 rounded-md border-2 transition-colors ${platform === p.name ? 'border-gold bg-gold/10' : 'border-transparent bg-charcoal'}`}
                                    >
                                        <div className={`mx-auto ${platform === p.name ? 'text-gold' : 'text-heather-gray'}`}>{p.icon}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="topic" className="text-sm font-medium text-heather-gray">Topic or Idea</label>
                            <textarea
                                id="topic"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                rows="3"
                                placeholder="e.g., A new seasonal tasting menu, behind the scenes of an event..."
                                className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                        </div>
                         <button onClick={handleGeneratePost} disabled={isLoading || !isApiConfigured} className="w-full mt-4 bg-gradient-to-r from-gold to-bright-yellow text-glossy-black font-bold py-3 px-4 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isLoading ? 'Generating...' : 'Generate Post'}
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    {(isLoading || post) && (
                        <div className="bg-card-black p-6 rounded-lg border border-white/10">
                            {isLoading && <Spinner text="Generating social media content..." />}
                            {error && <p className="text-red-400">{error}</p>}
                            {post && (
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="md:w-1/2">
                                        <h4 className="font-semibold text-gold mb-2">Generated Post for {platform}</h4>
                                        <div className="bg-charcoal p-4 rounded-md whitespace-pre-wrap text-heather-gray-light text-sm">{post}</div>
                                    </div>
                                    <div className="md:w-1/2">
                                        <h4 className="font-semibold text-gold mb-2">Generated Image</h4>
                                        <div className="aspect-square bg-charcoal rounded-md flex items-center justify-center">
                                            {isImageLoading ? <Spinner text="Generating Image..." /> : (imageUrl ? <img src={imageUrl} className="w-full h-full object-cover rounded-md"/> : <p className="text-heather-gray-dark text-sm">Image will appear here</p>)}
                                        </div>
                                         <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-heather-gray truncate italic pr-2">Prompt: "{imagePrompt}"</p>
                                            <button onClick={() => handleGenerateImage(imagePrompt)} disabled={isImageLoading || !imagePrompt} className="text-gold hover:text-bright-yellow disabled:opacity-50 flex-shrink-0">
                                                <RegenerateIcon />
                                            </button>
                                         </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
// --- END: From components/SocialMedia.js ---

// --- START: From components/Invoicing.js ---
const Invoicing = () => {
  return (
    <div>
      <PageHeader title="Invoicing" subtitle="Create, send, and track professional invoices." />
      <div className="flex flex-col items-center justify-center text-center bg-card-black border-2 border-dashed border-white/10 rounded-lg p-12 h-[60vh]">
        <InvoicingIcon className="w-16 h-16 text-gold mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon!</h2>
        <p className="text-heather-gray max-w-md">
          Our full-featured invoicing module is under development. Soon, you'll be able to seamlessly manage your client billing directly within ChefXOps.
        </p>
      </div>
    </div>
  );
};
// --- END: From components/Invoicing.js ---

// --- START: Component: Settings ---
const Settings = ({ showToast, onApiConfigChange }) => {
    const UPDATE_URL_KEY = 'chefxops_update_url';
    const API_KEY_KEY = 'chefxops_api_key';
    const MAP_ID_KEY = 'chefxops_map_id';

    const [updateUrl, setUpdateUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [mapId, setMapId] = useState('');

    useEffect(() => {
        setUpdateUrl(localStorage.getItem(UPDATE_URL_KEY) || '');
        setApiKey(localStorage.getItem(API_KEY_KEY) || '');
        setMapId(localStorage.getItem(MAP_ID_KEY) || '');
    }, []);

    const handleSave = () => {
        try {
            if (updateUrl && updateUrl.trim() !== '') {
                new URL(updateUrl);
            }
            localStorage.setItem(UPDATE_URL_KEY, updateUrl.trim());
            localStorage.setItem(API_KEY_KEY, apiKey.trim());
            localStorage.setItem(MAP_ID_KEY, mapId.trim());
            showToast('Settings saved successfully! Restart the app for all changes to take effect.', 'success');
            onApiConfigChange();
        } catch (e) {
            showToast('Invalid Update URL. Please enter a valid URL or leave blank.', 'error');
        }
    };

    const handleClearUpdate = () => {
        localStorage.removeItem(UPDATE_URL_KEY);
        setUpdateUrl('');
        showToast('Update source reset to local version. Restart required.', 'success');
    };

    return (
        <div>
            <PageHeader title="Settings" subtitle="Configure application settings and preferences." />
            <div className="bg-card-black p-6 rounded-lg border border-white/10 space-y-8">

                <div>
                    <h3 className="text-xl font-semibold text-white mb-2">API Configuration</h3>
                    <p className="text-sm text-heather-gray mb-4">
                        Enter your Google Cloud credentials here. These are stored securely in your browser and are required for all AI and Map features.
                    </p>
                    <div className="max-w-2xl space-y-4">
                        <div>
                            <label htmlFor="apiKey" className="text-sm font-medium text-heather-gray">Google Cloud API Key</label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder="Enter your API Key"
                                className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                        </div>
                        <div>
                            <label htmlFor="mapId" className="text-sm font-medium text-heather-gray">Google Maps Map ID</label>
                            <input
                                id="mapId"
                                type="text"
                                value={mapId}
                                onChange={e => setMapId(e.target.value)}
                                placeholder="Enter your Map ID for custom map styles"
                                className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                    <h3 className="text-xl font-semibold text-white mb-2">Remote Application Updates</h3>
                    <p className="text-sm text-heather-gray mb-4">
                        Configure a remote URL to automatically receive the latest application updates. Leave this blank to use the default version.
                        <br />
                        <strong className="text-gold">Changes will only take effect after you restart the application.</strong>
                    </p>
                    <div className="max-w-2xl">
                        <label htmlFor="updateUrl" className="text-sm font-medium text-heather-gray">Update Server URL</label>
                        <input
                            id="updateUrl"
                            type="text"
                            value={updateUrl}
                            onChange={e => setUpdateUrl(e.target.value)}
                            placeholder="https://example.com/latest/app.js"
                            className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                         <p className="text-xs text-heather-gray-dark mt-2">
                            Enter the full URL to the `app.js` file provided by your administrator.
                        </p>
                    </div>
                     <button onClick={handleClearUpdate} className="mt-4 bg-heather-gray/20 text-heather-gray-light font-bold py-2 px-6 rounded-lg hover:bg-heather-gray/30 transition-colors text-sm">
                        Reset to Local Version
                    </button>
                </div>
                
                <div className="border-t border-white/10 pt-8">
                     <button onClick={handleSave} className="bg-gold text-glossy-black font-bold py-3 px-8 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity">
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END: Component: Settings ---

// --- START: Component: Profile ---
const Profile = ({ showToast }) => {
    const { profile, setProfile } = useContext(ProfileContext);
    const [formData, setFormData] = useState(profile);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        setProfile(formData);
        showToast('Profile updated successfully!', 'success');
    };

    return (
        <div>
            <PageHeader title="My Profile" subtitle="Manage your personal and business information." />
            <div className="bg-card-black p-6 rounded-lg border border-white/10 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3 text-center">
                        <img src={formData.profileImage || 'https://i.pravatar.cc/300'} alt="Profile" className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-gold/50 object-cover" />
                        <label htmlFor="profileImage" className="text-sm font-medium text-heather-gray">Profile Image URL</label>
                        <input
                            id="profileImage"
                            type="text"
                            value={formData.profileImage}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.png"
                            className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                    </div>
                    <div className="md:w-2/3 space-y-6">
                        <div>
                            <label htmlFor="chefName" className="text-sm font-medium text-heather-gray">Your Name</label>
                            <input
                                id="chefName"
                                type="text"
                                value={formData.chefName}
                                onChange={handleInputChange}
                                className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                        </div>
                         <div>
                            <label htmlFor="businessName" className="text-sm font-medium text-heather-gray">Business Name</label>
                            <input
                                id="businessName"
                                type="text"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                className="w-full mt-1 bg-charcoal border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                        </div>
                        <div className="pt-2">
                             <button onClick={handleSave} className="bg-gold text-glossy-black font-bold py-2 px-6 rounded-lg shadow-glow-yellow hover:opacity-90 transition-opacity">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END: Component: Profile ---

// --- START: From components/Sidebar.js ---
const NavItem = ({ icon, label, view, activeView, onClick }) => {
  const isActive = activeView === view;
  return (
    <li
      onClick={() => onClick(view)}
      className={`relative flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ease-in-out group ${
        isActive ? 'bg-charcoal text-white shadow-glow-gold' : 'text-heather-gray hover:bg-white/5 hover:text-white'
      }`}
    >
      {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-bright-yellow to-gold rounded-r-full"></span>}
      <span className={`mr-4 transition-colors duration-200 ${isActive ? 'text-gold' : ''}`}>{icon}</span>
      <span className="font-semibold">{label}</span>
    </li>
  );
};

const Clock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    return (
        <div className="flex items-center justify-center space-x-2 text-heather-gray-dark p-4">
            <ClockIcon className="w-5 h-5 text-gold"/>
            <span className="font-mono text-lg font-semibold text-heather-gray">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
        </div>
    );
};

const Sidebar = ({ activeView, setActiveView }) => {
  const { profile } = useContext(ProfileContext);
  const navItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', view: 'dashboard' },
    { icon: <LeadsIcon />, label: 'Lead Generation', view: 'leads' },
    { icon: <AiAssistantIcon />, label: 'Onboard Culinary Agent', view: 'ai-assistant' },
    { icon: <SocialMediaIcon />, label: 'Social Media', view: 'social-media' },
    { icon: <KnowledgeIcon />, label: 'Knowledge Base', view: 'knowledge-base' },
    { icon: <MenuIcon />, label: 'Menu Generator', view: 'menu-generator' },
    { icon: <ChefToolsIcon />, label: 'Chef Tools', view: 'chef-tools' },
    { icon: <EventIcon />, label: 'Event Planning', view: 'event-planner' },
    { icon: <InvoicingIcon />, label: 'Invoicing', view: 'invoicing' },
    { icon: <IntegrationIcon />, label: 'Integrations', view: 'integrations' },
    { icon: <ExportIcon />, label: 'Export Center', view: 'export-center' },
    { icon: <SettingsIcon />, label: 'Settings', view: 'settings' },
  ];
  return (
    <aside className="w-72 bg-glossy-black border-r border-white/10 flex flex-col p-4">
      <div className="text-center py-4 mb-4">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wider">Chef<span className="text-gold">X</span>Ops</h1>
        <p className="text-xs text-heather-gray-dark mt-1 tracking-widest">By SPITFIREXMEDIA</p>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {navItems.map((item) => (
            <NavItem key={item.view} {...item} activeView={activeView} onClick={setActiveView} />
          ))}
        </ul>
      </nav>
      <div>
        <div onClick={() => setActiveView('profile')} className="p-4 my-2 bg-charcoal rounded-lg border border-white/10 flex items-center justify-between cursor-pointer hover:border-gold transition-colors">
            <div className="flex items-center">
                <img src={profile.profileImage || 'https://i.pravatar.cc/150'} alt="User" className="w-10 h-10 rounded-full mr-3 object-cover" />
                <div>
                    <p className="font-semibold text-white">{profile.chefName}</p>
                    <p className="text-xs text-heather-gray-dark">{profile.businessName}</p>
                </div>
            </div>
        </div>
        <Clock />
      </div>
    </aside>
  );
};
// --- END: From components/Sidebar.js ---

const App = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [toast, setToast] = useState(null);
    
    const [apiConfig, setApiConfig] = useState({
        apiKey: null,
        mapId: null,
        ai: null,
        isApiConfigured: false
    });
    
    const PROFILE_KEY = 'chefxops_profile';
    
    const [profile, setProfile] = useState(() => {
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
    
    const loadGoogleMapsScript = (apiKey, mapId) => {
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

    const showToast = (message, type = 'success') => {
        setToast({ message, type, id: Date.now() });
    };

    const handleAddLeads = (newLeads) => {
        const maxId = leads.reduce((max, l) => Math.max(l.id || 0, max), 0);
        const processedLeads = newLeads.map((lead, index) => ({
            ...lead,
            id: maxId + index + 1,
        }));
        setLeads(prevLeads => [...processedLeads, ...prevLeads]);
    };

    const handleAddEvent = (newEvent) => {
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
            <InfoIcon className="w-5 h-5 flex-shrink-0" />
            <span>API Key not configured. AI and Map features are disabled.</span>
            <button onClick={() => setActiveView('settings')} className="underline font-bold hover:text-gold transition-colors">Go to Settings</button>
        </div>
    );

    return (
        <ApiContext.Provider value={apiConfig}>
            <ProfileContext.Provider value={{ profile, setProfile }}>
                <div className="flex h-screen bg-charcoal text-white">
                    {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                    <main className="flex-1 flex flex-col overflow-hidden">
                        {!apiConfig.isApiConfigured && <ApiWarningBanner />}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="fade-in">
                              {renderContent()}
                            </div>
                        </div>
                    </main>
                </div>
            </ProfileContext.Provider>
        </ApiContext.Provider>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
