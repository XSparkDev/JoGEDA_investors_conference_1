import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Building2,
  Mail,
  User,
  Phone, 
  Globe,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  FileText,
  Camera,
  Linkedin,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { QrScanner } from '../components/QrScanner';
import { RegisterQrSection } from '../components/RegisterQrSection';
import QRCode from 'react-qr-code';

interface TemplateProps {
  onRegister: () => void;
  onOpenAdmin: () => void;
}

export const JoGedaTemplate: React.FC<TemplateProps> = ({ onRegister, onOpenAdmin }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);
  const [hasOpenedUrlForScan, setHasOpenedUrlForScan] = useState(false);
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);

  // About section image carousel
  const aboutSectionImages = [
    '/assets/images/IMG_1888.jpg',
    '/assets/images/IMG_1885.jpg',
    '/assets/images/IMG_1882.jpg',
  ];
  const [aboutSectionImageIndex, setAboutSectionImageIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const intervalId = window.setInterval(() => {
      setAboutSectionImageIndex((prev) => (prev + 1) % aboutSectionImages.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [aboutSectionImages.length]);
  const sectorContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const sectorItem = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <header className="relative bg-white overflow-x-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <img 
            src="/assets/images/30.webp"
            alt="Joe Gqabi Landscape" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-12 relative z-10">
          <div className="flex items-start justify-between mb-20">
              <img
                src="/assets/images/1.png"
                className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] md:h-[300px] md:w-[300px] object-contain"
                alt="Conference Logo"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block absolute top-0 right-[550px] pointer-events-none">
                <img
                  src="/assets/images/7.png"
                  className="h-[300px] w-[300px] object-contain"
                  alt="Joe Gqabi District Municipality"
                  referrerPolicy="no-referrer"
                />
              </div>
          </div>

          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-8xl uppercase leading-[0.85] mt-2">
                Investment <br />
                <span className="text-jogeda-green">Conference</span>
              </h1>
              <p className="text-zinc-500 font-bold mt-6 max-w-lg">
                Hosted by the Joe Gqabi Economic Development Agency (JoGEDA) in partnership with the Joe Gqabi District.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <div className="text-jogeda-green font-display font-black text-5xl sm:text-7xl md:text-9xl uppercase leading-none">
                2026
              </div>
              <div className="w-32 h-3 bg-jogeda-dark mt-4" />
            </motion.div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-jogeda-green p-8 text-white shadow-xl shadow-jogeda-green/20">
                <h3 className="font-display font-bold uppercase text-xs tracking-widest mb-4 text-jogeda-dark">The Theme</h3>
                <p className="text-xl font-black leading-tight uppercase">
                  Investing in Real Economies: Growing Joe Gqabi Together
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Calendar className="text-jogeda-green w-5 h-5" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-sm">4th &amp; 5th of June 2026</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                    <MapPin className="text-jogeda-green w-5 h-5" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-sm">Joe Gqabi District</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={onRegister}
                    className="inline-flex items-center justify-center bg-jogeda-dark text-white px-6 sm:px-10 py-5 font-display font-black uppercase tracking-widest text-center whitespace-nowrap hover:bg-jogeda-green hover:text-jogeda-dark transition-all w-fit shadow-lg shadow-black/10"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isScannerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-zinc-100 relative">
            <button
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jogeda-green">
                Quick Access
              </p>
              <h2 className="mt-1 text-2xl font-display font-black uppercase text-jogeda-dark">
                Scan Your Conference QR
              </h2>
              <p className="mt-2 text-xs text-zinc-500">
                Use this scanner to quickly access conference content, check-in points or session details via your QR code.
              </p>
            </div>
            <QrScanner
              onResult={(value) => {
                const cleaned = value.trim();
                setScanResult(cleaned);
                setScanError(null);
                setCheckInMessage(null);

                if (!hasOpenedUrlForScan) {
                  let urlToOpen: string | null = null;

                  if (/^https?:\/\//i.test(cleaned)) {
                    urlToOpen = cleaned;
                  } else if (/^www\./i.test(cleaned)) {
                    urlToOpen = `https://${cleaned}`;
                  }

                  if (urlToOpen) {
                    setHasOpenedUrlForScan(true);

                    try {
                      const urlObj = new URL(urlToOpen);
                      const cardIndex = urlObj.searchParams.get('cardIndex');

                      if (cardIndex === '0') {
                        setIsScannerOpen(false);
                        setShowRegisteredModal(true);
                      } else {
                        setIsScannerOpen(false);
                        window.location.href = urlToOpen;
                      }
                    } catch {
                      // Fallback: if URL parsing fails, just navigate as-is
                      setIsScannerOpen(false);
                      window.location.href = urlToOpen;
                    }
                  }
                }
              }}
              onError={(message) => {
                setScanError(message);
                setCheckInMessage(null);
              }}
              onCheckInComplete={(message) => {
                setCheckInMessage(message);
              }}
            />
            {(scanResult || scanError || checkInMessage) && (
              <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-3 text-xs">
                {scanResult && (
                  <div className="mb-1">
                    <p className="font-black uppercase tracking-[0.18em] text-jogeda-dark">
                      Last Scan
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-zinc-700">
                      {scanResult}
                    </p>
                  </div>
                )}
                {checkInMessage && (
                  <p className="mt-1 text-[11px] font-medium text-jogeda-green">
                    {checkInMessage}
                  </p>
                )}
                {scanError && (
                  <p className="mt-1 text-[11px] font-medium text-red-500">
                    {scanError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showRegisteredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-zinc-100 text-center relative">
            <button
              type="button"
              onClick={() => setShowRegisteredModal(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-jogeda-green text-jogeda-dark">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-display font-black uppercase text-jogeda-dark mb-2">
              Registered
            </h2>
            <p className="text-sm text-zinc-600 mb-6">
              Your XS Card contact has been registered successfully.
            </p>
            <button
              type="button"
              onClick={() => setShowRegisteredModal(false)}
              className="inline-flex items-center justify-center rounded-xl bg-jogeda-dark px-6 sm:px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white whitespace-nowrap hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="sub-heading">Background & Rationale</span>
              <h2 className="section-heading mb-8">Why Invest <br /><span className="text-jogeda-green">In Joe Gqabi?</span></h2>
              <p className="text-xl text-zinc-600 leading-relaxed mb-8">
                Joe Gqabi District offers a compelling mix of natural resources, agricultural potential, and strategic logistics positioning. The district is primed for growth across agriculture, tourism, renewable energy, and infrastructure development.
              </p>
              <div className="space-y-4">
                {[
                  'Showcase 10+ bankable investment opportunities',
                  'Enable deal-making and financial commitments',
                  'Promote the Joe Gqabi District as an anchor investment hub',
                  'Strengthen regional competitiveness'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-jogeda-green w-6 h-6 flex-shrink-0" />
                    <span className="font-bold text-zinc-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-jogeda-green absolute -inset-4 -z-10 rounded-3xl rotate-3" />
              <div className="relative rounded-2xl shadow-2xl w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={aboutSectionImageIndex}
                    src={aboutSectionImages[aboutSectionImageIndex]}
                    alt="Joe Gqabi Nature"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, y: 12, scale: 1.02 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Messages */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="sub-heading">Leadership</span>
            <h2 className="section-heading">Welcome <span className="text-jogeda-green">Messages</span></h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Executive Mayor',
                name: 'Cllr Nomvuyo Mposelwa',
                msg: 'The Joe Gqabi District Municipality is entering a decisive phase of economic repositioning. We are transforming our structural advantages into structured investment opportunities.',
                img: '/assets/images/28.png'
              },
              {
                title: 'Board Chairperson',
                name: 'Mr Bantu Magqashela',
                msg: 'This pivotal conference is defined by economic transition and renewed focus on sustainable economic growth. We carry a dual responsibility to deliver commercial value.',
                img: '/assets/images/22.png'
              },
              {
                title: 'Chief Executive Officer',
                name: 'Dr Vuyiwe Marambana',
                msg: 'The Joe Gqabi Investment Conference marks a significant milestone in our collective effort to reposition the district as a serious contender for sustainable investment.',
                img: '/assets/images/24.png'
              }
            ].map((leader, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center text-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 hexagon-clip mb-4 sm:mb-6 overflow-hidden">
                  <img src={leader.img} alt={leader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="font-display font-black uppercase text-jogeda-green text-xs sm:text-sm tracking-widest mb-1">{leader.title}</h3>
                <p className="font-bold text-base sm:text-lg mb-4">{leader.name}</p>
                <p className="text-zinc-500 text-sm leading-relaxed italic">"{leader.msg}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Priority Sectors */}
      <section className="py-24 bg-jogeda-green text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8"
          >
            <div className="max-w-2xl">
              <span className="font-display font-bold uppercase tracking-widest text-jogeda-dark">Opportunities</span>
              <h2 className="font-display font-black text-5xl md:text-7xl uppercase leading-none mt-4">Priority <br />Investment <span className="text-jogeda-dark">Sectors</span></h2>
            </div>
            <div />
          </motion.div>

          <motion.div
            variants={sectorContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'Agriculture & Agro-processing', items: ['Feedlot', 'Packhouses', 'Fresh Produce Market'] },
              { title: 'Tourism & Property Development', items: ['Spa precinct revival', 'Orange River Waterfront'] },
              { title: 'Renewable Energy', items: ['Solar PV farms', 'Battery storage', 'Agri-energy'] },
              { title: 'Industrial & Logistics', items: ['Industrial Park Development', 'Warehousing'] },
              { title: 'Mining & Beneficiation', items: ['Sandstone and Limestone value-addition'] }
            ].map((sector, i) => (
              <motion.div
                key={i}
                variants={sectorItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors group"
              >
                <h3 className="text-xl font-bold leading-tight mb-6">{sector.title}</h3>
                <ul className="space-y-3">
                  {sector.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm font-medium opacity-85 group-hover:opacity-100">
                      <div className="w-1.5 h-1.5 bg-jogeda-dark rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <RegisterQrSection />

      {/* Partners Section */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="sub-heading">Collaborators</span>
            <h2 className="section-heading">Our <span className="text-jogeda-green">Partners</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/assets/images/9.png" alt="Partner Logo 1" className="h-24 md:h-32 w-auto object-contain" referrerPolicy="no-referrer" />
            <img src="/assets/images/10.png" alt="Partner Logo 2" className="h-24 md:h-32 w-auto object-contain" referrerPolicy="no-referrer" />
            <img src="/assets/images/11.png" alt="Partner Logo 3" className="h-24 md:h-32 w-auto object-contain" referrerPolicy="no-referrer" />
            <img src="/assets/images/12.png" alt="Partner Logo 4" className="h-24 md:h-32 w-auto object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <footer className="bg-jogeda-dark text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20">
          <div>
            <h2 className="font-display font-black text-5xl uppercase mb-12">Contact <span className="text-jogeda-green">Us</span></h2>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-jogeda-green rounded-full flex items-center justify-center text-jogeda-dark">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Call Us</p>
                  <p className="text-xl font-bold">051 023 0600</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-jogeda-green rounded-full flex items-center justify-center text-jogeda-dark">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Email Us</p>
                  <p className="text-xl font-bold">communications@jogeda.co.za</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-jogeda-green rounded-full flex items-center justify-center text-jogeda-dark">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Website</p>
                  <p className="text-xl font-bold">www.jogeda.co.za</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-jogeda-green rounded-full flex items-center justify-center text-jogeda-dark">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Address</p>
                  <p className="text-xl font-bold">27 Dan Pienaar Ave, Springs, Maletswai</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 p-12 rounded-3xl border border-white/10">
            <h3 className="text-2xl font-bold mb-8">Ready to invest?</h3>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Join us in Maletswai this June to explore the bankable projects shaping the future of the Joe Gqabi District.
            </p>
            <button 
              onClick={onRegister}
              className="inline-flex items-center justify-center w-full px-6 py-5 rounded-xl bg-jogeda-green text-jogeda-dark font-display font-black uppercase tracking-widest text-center hover:scale-[1.02] transition-transform"
            >
              Secure Your Delegate Spot
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">
          <p>© 2026 Joe Gqabi Economic Development Agency (JoGEDA)</p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-widest text-zinc-600/80 hover:text-zinc-300 transition-colors"
            aria-label="Organiser dashboard access"
          >
            Siya Phambili Asijiki
          </button>
        </div>
      </footer>
    </div>
  );
};

// --- REGISTRATION FORM ---
interface RegistrationFormProps {
  onBack: () => void;
  hideStep4?: boolean;
  onSuccess?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onBack,
  hideStep4,
  onSuccess,
}) => {
  const MIN_PASSWORD_LENGTH = 6;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCodeOfConduct, setShowCodeOfConduct] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: '',
    title: '',
    organisation: '',
    email: '',
    phone: '',
    bio: '',
    investmentFocus: '',
    linkedinWebsite: '',
    photoConsent: false,
    codeOfConduct: false,
    photographyConsent: false,
    headshot: null as File | null
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const apiBaseUrl =
    (import.meta as any).env?.VITE_BASE_URL ||
    (import.meta as any).env?.BASE_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.BASE_URL : '');

  const conferenceCode =
    (import.meta as any).env?.VITE_CONFERENCE_CODE ||
    (import.meta as any).env?.CONFERENCE_CODE ||
    (typeof process !== 'undefined' ? (process as any).env?.CONFERENCE_CODE : '');

  const conferenceApiKey =
    (import.meta as any).env?.VITE_CONFERENCE_API_KEY ||
    (import.meta as any).env?.CONFERENCE_API_KEY ||
    (typeof process !== 'undefined' ? (process as any).env?.CONFERENCE_API_KEY : '');

  const googlePlayUrl =
    (import.meta as any).env?.VITE_GOOGLE_PLAY_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_GOOGLE_PLAY_URL : '');

  const appleAppUrl =
    (import.meta as any).env?.VITE_APPLE_APP_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_APPLE_APP_URL : '');

  const supabaseFunctionsBaseUrl =
    (import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_FUNCTIONS_URL : '') ||
    '';
  const supabaseAnonKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_ANON_KEY : '') ||
    '';

  type DeviceType = 'android' | 'ios' | 'desktop';

  const getDeviceType = (): DeviceType => {
    if (typeof navigator === 'undefined') return 'desktop';
    const ua = navigator.userAgent || (navigator as any).vendor || '';

    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';

    return 'desktop';
  };

  const deviceType = getDeviceType();

  const totalSteps = hideStep4 ? 3 : 4;

  // Single redirect page used by the "desktop" QR in step 4.
  // When scanned (typically by a phone), the redirect page forwards to the correct app store.
  const installRedirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?install=1&cardIndex=1`
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError(null);
    let notifySuccess = false;

    try {
      const trimmedPassword = password.trim();
      if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }

      const nameForBackend =
        `${formData.firstName} ${formData.lastName}`.trim() || formData.preferredName;
      const surnameForBackend = formData.lastName || '';

      const payload = {
        name: nameForBackend,
        surname: surnameForBackend,
        email: formData.email,
        password: trimmedPassword,
        conferenceCode,
        termsAccepted: formData.codeOfConduct,
        privacyAccepted: formData.photographyConsent
      };

      const response = await fetch(`${apiBaseUrl}/AddUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(conferenceApiKey ? { Authorization: `Bearer ${conferenceApiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        // AddUser creates the user account; UploadImages creates the card.
        const xsUserId =
          data?.userId ?? data?.userData?.uid ?? data?.userData?.userId;

        if (!xsUserId) {
          throw new Error('XS userId missing from AddUser response.');
        }

        // JSON-only UploadImages: no alternatePhone and no images.
        const uploadImagesRes = await fetch(
          `${apiBaseUrl}/Users/${encodeURIComponent(xsUserId)}/UploadImages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(conferenceApiKey ? { Authorization: `Bearer ${conferenceApiKey}` } : {}),
            },
            body: JSON.stringify({
              phone: formData.phone,
              occupation: formData.title,
              company: formData.organisation,
            }),
          }
        );

        const uploadImagesData = await uploadImagesRes
          .json()
          .catch(() => ({} as any));

        if (!uploadImagesRes.ok) {
          setError(
            (uploadImagesData && uploadImagesData.message) ||
              'Failed to create XS card. Please try again.'
          );
          return;
        }

              // Mirror into Supabase only after BOTH AddUser and UploadImages succeed.
        if (supabaseFunctionsBaseUrl) {
          const mirrorExtended = {
            conferenceCode,
            firstName: formData.firstName,
            lastName: formData.lastName,
            preferredName: formData.preferredName,
            title: formData.title,
            organisation: formData.organisation,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            investmentFocus: formData.investmentFocus,
            linkedinWebsite: formData.linkedinWebsite,
            photoConsent: formData.photoConsent,
            codeOfConduct: formData.codeOfConduct,
            photographyConsent: formData.photographyConsent,
            xsUserId,
          };

          const mirrorForm = new FormData();
          mirrorForm.append('xsPayload', JSON.stringify(payload));
          mirrorForm.append('extended', JSON.stringify(mirrorExtended));

          if (formData.photoConsent && formData.headshot) {
            mirrorForm.append('headshot', formData.headshot, formData.headshot.name);
          }

          try {
            await fetch(`${supabaseFunctionsBaseUrl}/mirror-registration`, {
              method: 'POST',
              headers: {
                ...(supabaseAnonKey
                  ? {
                      apikey: supabaseAnonKey,
                      Authorization: `Bearer ${supabaseAnonKey}`,
                    }
                  : {}),
              },
              body: mirrorForm,
            });
          } catch (mirrorErr) {
            console.warn('Supabase mirror failed (non-blocking):', mirrorErr);
          }
        }

        if (onSuccess) {
          notifySuccess = true;
        } else {
          setSuccess(true);
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
      if (notifySuccess) onSuccess?.();
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white p-12 md:p-20 rounded-[2rem] shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-jogeda-green rounded-full flex items-center justify-center mx-auto mb-8 text-jogeda-dark">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-display font-black uppercase mb-4">Success!</h2>
          <p className="text-zinc-600 text-lg mb-10">
            User added successfully. Please check your email to verify your account.
          </p>
          <button 
            onClick={onBack}
            className="inline-flex items-center justify-center bg-jogeda-dark text-white px-6 sm:px-10 py-4 rounded-xl font-display font-black uppercase tracking-widest text-center whitespace-nowrap hover:bg-jogeda-green transition-all"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (showCodeOfConduct) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl bg-white p-8 md:p-16 rounded-[2rem] shadow-2xl border border-zinc-100"
        >
          <button
            onClick={() => setShowCodeOfConduct(false)}
            className="mb-8 inline-flex items-center justify-center gap-2 text-sm font-bold text-zinc-400 hover:text-jogeda-green transition-colors uppercase tracking-widest whitespace-nowrap"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to registration
          </button>

          <h2 className="text-3xl md:text-4xl font-display font-black uppercase text-jogeda-dark leading-tight mb-6">
            Event Code of Conduct
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            To ensure a safe, professional and productive environment for all attendees, partners and staff, all delegates are
            required to adhere to the following Code of Conduct throughout the Joe Gqabi Investment Conference.
          </p>

          <ul className="space-y-4 text-sm text-zinc-700">
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Professional Behaviour</span>
              <p className="mt-1">
                Treat all delegates, speakers, service providers and staff with courtesy, respect and professionalism at all times.
                Harassment, discrimination, intimidation or any form of abusive behaviour will not be tolerated.
              </p>
            </li>
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Safe Environment</span>
              <p className="mt-1">
                Follow all venue, safety and security rules. Obey instructions from event organisers, security personnel and venue
                management, especially in relation to health, safety and emergency procedures.
              </p>
            </li>
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Confidentiality & Privacy</span>
              <p className="mt-1">
                Respect the confidentiality of commercial information shared during sessions and bilateral meetings. Do not record,
                photograph or distribute sensitive information without explicit permission.
              </p>
            </li>
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Responsible Networking</span>
              <p className="mt-1">
                Engage in constructive and ethical networking. Aggressive solicitation, inappropriate advances or disruptive
                marketing activities are prohibited.
              </p>
            </li>
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Alcohol & Substances</span>
              <p className="mt-1">
                Consume alcohol responsibly at official functions and do not engage in any illegal substance use. Behaviour
                impaired by alcohol or substances that affects the safety or comfort of others will lead to removal from the event.
              </p>
            </li>
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Respect for Programme & Venue</span>
              <p className="mt-1">
                Honour the formal programme, time allocations and speaking opportunities. Respect the venue facilities, equipment
                and staff, and report any damage or incidents immediately to the organisers.
              </p>
            </li>
            <li>
              <span className="font-bold text-jogeda-green uppercase tracking-widest text-[11px]">Non‑Compliance</span>
              <p className="mt-1">
                The organisers reserve the right to take appropriate action, including removal from the event without refund, for
                any behaviour that breaches this Code of Conduct.
              </p>
            </li>
          </ul>

          <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-bold mt-8">
            By proceeding with your registration, you confirm that you have read, understood and agree to abide by this Code of
            Conduct.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white p-8 md:p-16 rounded-[2rem] shadow-2xl border border-zinc-100"
      >
        <button onClick={onBack} className="mb-12 inline-flex items-center justify-center gap-2 text-sm font-bold text-zinc-400 hover:text-jogeda-green transition-colors uppercase tracking-widest">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to landing
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-jogeda-green text-jogeda-dark px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded">
              Section {step} of {totalSteps}
            </span>
            <div className="flex gap-2 flex-1">
              {Array.from({ length: totalSteps }, (_v, i) => i + 1).map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-jogeda-green' : 'bg-zinc-100'}`} />
              ))}
            </div>
          </div>
          <h2 className="text-4xl font-display font-black uppercase text-jogeda-dark leading-none">
            {step === 1
              ? 'Delegate Details'
              : step === 2
              ? 'Professional Profile'
              : step === 3
              ? 'Media & Consent'
              : 'Get the XS Card App'}
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            Joe Gqabi Investment Conference 2026 Registration
          </p>
          <p className="mt-1 text-sm text-zinc-600 font-medium">
            Completing this form will also create your XS Card digital profile for networking and
            event communications.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. John"
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Smith"
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Preferred Name (if different)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input 
                      type="text" 
                      placeholder="e.g. Johnny"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                      value={formData.preferredName}
                      onChange={e => setFormData({...formData, preferredName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Title *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Director"
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Organisation *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Acme Corp"
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={formData.organisation}
                        onChange={e => setFormData({...formData, organisation: e.target.value})}
                      />
                    </div>
                  </div>
                </div>


                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        type="tel" 
                        placeholder="+27..."
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Password *</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input 
                        required
                        minLength={MIN_PASSWORD_LENGTH}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-jogeda-dark transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="pt-8 text-[10px] font-black tracking-[0.2em] text-zinc-400">
                    Note: You are creating credentials for XS card. You&apos;ll need them to log onto the XS card app.
                  </p>
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Bio (75-100 words) *</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-zinc-300" />
                    <textarea 
                      required
                      placeholder="Tell us about your professional background..."
                      rows={5}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold resize-none"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Primary Investment Focus *</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <select
                      required
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold appearance-none"
                      value={formData.investmentFocus}
                      onChange={e => setFormData({ ...formData, investmentFocus: e.target.value })}
                    >
                      <option value="" disabled>
                        Select your primary investment focus
                      </option>
                      <option value="Agriculture & Agro-processing">Agriculture &amp; Agro-processing</option>
                      <option value="Tourism & Property Development">Tourism &amp; Property Development</option>
                      <option value="Renewable Energy">Renewable Energy</option>
                      <option value="Industrial & Logistics">Industrial &amp; Logistics</option>
                      <option value="Mining & Beneficiation">Mining &amp; Beneficiation</option>
                      <option value="Other">Other / Cross-cutting Investments</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ) : step === 3 ? (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Upload Professional Headshot (optional)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-200 border-dashed rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 text-zinc-400 mb-2" />
                        <p className="text-xs text-zinc-500 font-bold">
                          {formData.headshot ? formData.headshot.name : 'Click to upload (JPG/PNG)'}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={e => setFormData({...formData, headshot: e.target.files?.[0] || null})}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-200 bg-zinc-50 transition-all checked:bg-jogeda-green checked:border-jogeda-green"
                        checked={formData.photoConsent}
                        onChange={e => setFormData({...formData, photoConsent: e.target.checked})}
                      />
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-jogeda-dark opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 pointer-events-none" />
                    </div>
                    <span className="text-xs text-zinc-600 font-medium">
                      I approve the use of this photo for my badge, lanyard and attendee directory.
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">LinkedIn or Business Website (Optional)</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input 
                      type="text" 
                      placeholder="https://linkedin.com/in/..."
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-jogeda-green transition-all font-bold"
                      value={formData.linkedinWebsite}
                      onChange={e => setFormData({...formData, linkedinWebsite: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input 
                        type="checkbox" 
                        required
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-200 bg-zinc-50 transition-all checked:bg-jogeda-green checked:border-jogeda-green"
                        checked={formData.codeOfConduct}
                        onChange={e => setFormData({...formData, codeOfConduct: e.target.checked})}
                      />
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-jogeda-dark opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 pointer-events-none" />
                    </div>
                    <span className="text-xs text-zinc-600 font-medium">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowCodeOfConduct(true)}
                        className="inline-flex items-center justify-center text-jogeda-green font-bold hover:underline"
                      >
                        Event Code of Conduct
                      </button>{' '}
                      *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input 
                        type="checkbox" 
                        required
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-200 bg-zinc-50 transition-all checked:bg-jogeda-green checked:border-jogeda-green"
                        checked={formData.photographyConsent}
                        onChange={e => setFormData({...formData, photographyConsent: e.target.checked})}
                      />
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-jogeda-dark opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 pointer-events-none" />
                    </div>
                    <span className="text-xs text-zinc-600 font-medium">
                      I consent to event photography and media use *
                    </span>
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-jogeda-green">
                    Optional but strongly recommended
                  </p>
                  <p className="text-sm text-zinc-600">
                    Install the XS Card app to manage your delegate profile, networking, meetings and event updates in real time.
                  </p>
                </div>

                {deviceType === 'desktop' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-10">
                      <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                        {installRedirectUrl ? (
                          <QRCode
                            value={installRedirectUrl}
                            size={180}
                            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                          />
                        ) : (
                          <div className="w-44 h-44 flex items-center justify-center text-xs text-zinc-500">
                            Unable to generate QR
                          </div>
                        )}
                      </div>
                      <p className="text-center text-sm text-zinc-600 max-w-sm">
                        Point your phone&rsquo;s camera at this QR code to download XS Card from the correct app store.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowCredentials((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-700 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
                      >
                        Show credentials
                      </button>
                      {showCredentials && (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700 space-y-2">
                          <p><span className="font-black">Email:</span> {formData.email || 'Not provided yet'}</p>
                          <p><span className="font-black">Password:</span> {password || 'Not provided yet'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {deviceType === 'android' && (
                  <div className="space-y-6 rounded-2xl border border-jogeda-green/40 bg-jogeda-green/5 px-6 py-8">
                    <p className="text-sm text-zinc-700">
                      You are using an Android device. Install the XS Card app now to complete your profile, receive updates and
                      network with other delegates.
                    </p>
                    {googlePlayUrl ? (
                      <a
                        href={googlePlayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-jogeda-green px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-jogeda-dark hover:bg-jogeda-dark hover:text-white transition-colors"
                      >
                        Open in Google Play
                      </a>
                    ) : null}
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowCredentials((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-700 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
                      >
                        Show credentials
                      </button>
                      {showCredentials && (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700 space-y-2">
                          <p><span className="font-black">Email:</span> {formData.email || 'Not provided yet'}</p>
                          <p><span className="font-black">Password:</span> {password || 'Not provided yet'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {deviceType === 'ios' && (
                  <div className="space-y-6 rounded-2xl border border-jogeda-green/40 bg-jogeda-green/5 px-6 py-8">
                    <p className="text-sm text-zinc-700">
                      You are using an iOS device. Install the XS Card app to keep your delegate details handy, access your
                      tickets and stay in sync with the programme.
                    </p>
                    {appleAppUrl ? (
                      <a
                        href={appleAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-jogeda-green px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-jogeda-dark hover:bg-jogeda-dark hover:text-white transition-colors"
                      >
                        Open in App Store
                      </a>
                    ) : null}
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowCredentials((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-700 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
                      >
                        Show credentials
                      </button>
                      {showCredentials && (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700 space-y-2">
                          <p><span className="font-black">Email:</span> {formData.email || 'Not provided yet'}</p>
                          <p><span className="font-black">Password:</span> {password || 'Not provided yet'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Note: You can proceed without installing the app, but we recommend completing this step to unlock the full digital
                  conference experience.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 w-full">
            <button
              type="button"
              disabled={loading || step === 1}
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-4 rounded-xl border border-zinc-200 text-xs font-black uppercase tracking-[0.2em] text-center text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous Section
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 sm:px-6 py-5 bg-jogeda-dark text-white rounded-xl font-display font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-jogeda-green transition-all group disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {step < totalSteps ? 'Continue' : 'Complete Registration'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
