import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-indigo-950 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Cyberpunk Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/grid-overlay.svg')] opacity-20 z-0"></div>
        
        {/* Neon Glow Effect */}
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-fuchsia-600 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute -top-20 right-20 w-[300px] h-[300px] bg-cyan-500 rounded-full blur-[100px] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-fuchsia-600 to-cyan-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                ScribexX
              </span>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <Link href="#features" className="hover:text-fuchsia-400 transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-fuchsia-400 transition-colors">How It Works</Link>
              <Link href="#testimonials" className="hover:text-fuchsia-400 transition-colors">Testimonials</Link>
              <Link href="/login" className="px-4 py-2 rounded-full border border-fuchsia-500 hover:bg-fuchsia-500/20 transition-all">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 transition-all">
                Sign Up
              </Link>
            </div>
            <button className="md:hidden text-2xl">☰</button>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="block">Level Up Your</span>
                <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  Writing Skills
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                An RPG-style writing app that transforms learning into an adventure. 
                Develop your skills, explore a vibrant world, and unleash your creativity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 transition-all text-center font-medium">
                  Start Your Journey
                </Link>
                <Link href="#how-it-works" className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all text-center">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-cyan-600 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden">
                <div className="aspect-video w-full relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-lg"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">ScribexX Writer</h3>
                    <p className="text-gray-300">Your adventure awaits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 bg-[url('/grid-overlay.svg')] opacity-10 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              Embark on Your Writing Adventure
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all group">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">REDI Skill Tree</h3>
              <p className="text-gray-400">Master writing skills through an RPG-style skill tree. Complete lessons, earn rewards, and level up your abilities.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-all group">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">OWL World Map</h3>
              <p className="text-gray-400">Explore an open world filled with writing quests. Your words literally shape and transform the virtual environment.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Character Development</h3>
              <p className="text-gray-400">Create and customize your avatar. Choose a writing class, earn stat points, and collect special items.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Feedback</h3>
              <p className="text-gray-400">Receive immediate, objective feedback on your writing. Get unstuck with the "Writer's Block" feature.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all group">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-fuchsia-600 to-pink-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Faction System</h3>
              <p className="text-gray-400">Join or create factions with classmates. Collaborate on writing projects and compete in challenges.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-all group">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Daily Quests</h3>
              <p className="text-gray-400">Complete short, engaging writing prompts daily. Build streaks and earn bonus rewards for consistency.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative bg-black/30">
        <div className="absolute inset-0 bg-[url('/grid-overlay.svg')] opacity-10 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              How ScribexX Works
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your Character</h3>
              <p className="text-gray-400">Design your avatar, choose a writing class, and begin your journey in the world of ScribexX.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Master Writing Skills</h3>
              <p className="text-gray-400">Progress through the REDI skill tree and complete OWL quests to develop your writing abilities.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Shape the World</h3>
              <p className="text-gray-400">Watch as your writing transforms the virtual world. Participate in events and build your personal haven.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Begin Your Writing Adventure?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students who are leveling up their writing skills while having fun.
            </p>
            <Link href="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 transition-all text-center font-medium text-lg inline-block">
              Start Your Journey Today
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-fuchsia-600 to-cyan-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                ScribexX
              </span>
            </div>
            <div className="flex gap-8 mb-6 md:mb-0">
              <Link href="#features" className="hover:text-fuchsia-400 transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-fuchsia-400 transition-colors">How It Works</Link>
              <Link href="#testimonials" className="hover:text-fuchsia-400 transition-colors">Testimonials</Link>
              <Link href="/privacy" className="hover:text-fuchsia-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-fuchsia-400 transition-colors">Terms</Link>
            </div>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-fuchsia-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-fuchsia-500 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-fuchsia-500 transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            <p>© 2023 ScribexX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
