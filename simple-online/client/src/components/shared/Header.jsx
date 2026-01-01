import { useState, useEffect } from 'react';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary-900/95 backdrop-blur-lg shadow-xl' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-primary-700 font-bold text-xl">ER</span>
                        </div>
                        <div>
                            <h1 className="text-white text-2xl font-bold">Simple y Legal</h1>
                            <p className="text-primary-200 text-xs">Asesorías Legales</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;