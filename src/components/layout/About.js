import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function About() {
  const purposes = [
    {
      title: "Scholarship Program Impact",
      description:
        "Since our inception, we've supported over 300 students through our scholarship program, providing financial assistance to help them achieve their academic dreams. Our program has transformed lives and created opportunities for deserving students across Nigeria.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7" />
        </svg>
      ),
      stats: { students: "300+", value: "₦10M+", institutions: "50+" }
    },
    {
      title: "Support Education",
      description:
        "Your support can make a difference in students' lives. Through donations, we can provide more scholarships and help more students access quality education. Join us in creating a brighter future for Nigeria's youth.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      stats: { donors: "100+", impact: "95%", regions: "36" }
    },
    {
      title: "Success Stories",
      description:
        "Our scholarship recipients have gone on to excel in their studies and make meaningful contributions to their communities. Read their inspiring stories and see how your support can help create more success stories.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      stats: { stories: "100+", graduates: "200+", testimonials: "50+" }
    }
  ];

  const [currentPurpose, setCurrentPurpose] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPurpose((prevPurpose) => (prevPurpose + 1) % purposes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [purposes.length]);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50" id="about">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h4 className="text-[rgb(130,88,18)] font-semibold mb-4">WHAT WE DO</h4>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Transforming Lives Through Education
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to making quality education accessible to deserving students through our scholarship program. Join us in creating opportunities and transforming lives.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center gap-6 mb-6">
                <div className="p-4 rounded-full bg-[rgb(130,88,18)]/10 text-[rgb(130,88,18)]">
                  {purposes[currentPurpose].icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {purposes[currentPurpose].title}
                </h3>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                {purposes[currentPurpose].description}
              </p>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(purposes[currentPurpose].stats).map(([key, value]) => (
                  <div key={key} className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-[rgb(130,88,18)]">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/scholarships"
                className="group relative px-8 py-4 bg-[rgb(130,88,18)] text-white rounded-full overflow-hidden transition-all duration-300 hover:bg-[rgb(110,68,0)] text-center"
              >
                <span className="relative z-10 text-lg font-medium">Apply for Scholarship</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              
              <Link
                to="/donate"
                className="px-8 py-4 border-2 border-[rgb(130,88,18)] text-[rgb(130,88,18)] rounded-full text-lg font-medium hover:bg-[rgb(130,88,18)] hover:text-white transition-all duration-300 text-center"
              >
                Support Students
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[rgb(130,88,18)]/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[rgb(130,88,18)]/10 rounded-full blur-xl"></div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/landingabt.png"
                alt="Students learning"
                className="w-full h-[500px] object-cover transform transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-4 text-white">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Virtual Learning Environment</h4>
                    <p className="text-sm opacity-75">Access your courses anytime, anywhere</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;