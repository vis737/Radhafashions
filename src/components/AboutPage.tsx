import React from 'react';
import { motion } from 'motion/react';
import { Heart, Scissors, GraduationCap, Crown, Sparkles, Star, ShoppingBag, Users, Palette } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const products = [
  'Designer & Customized Blouses',
  'Traditional & Designer Bangles',
  'Sarees & Saree Accessories',
  'Bridal Fashion Accessories',
  'Saree Tassels & Kuchu',
  'Embroidery Products',
  'Boutique Fashion Accessories',
  'Traditional & Modern Fashion Items',
];

const services = [
  'Bridal Designing & Customization',
  'Designer Blouse Making',
  'Hand & Machine Embroidery',
  'Salwar & Lehenga Designing',
  'Saree Tassels (Kuchu) Making',
  'Tanjavur Painting on Blouses',
  'Complete Fashion Designing',
  'Boutique Customization',
];

const bridalServices = [
  'Bridal Makeup & Hair Styling',
  'Nail Art & Extensions',
  'Mehendi Art',
  'Bridal Blouse Designing',
  'Lehenga Customization',
  'Bridal Embroidery & Embellishment',
  'Saree & Accessory Customization',
];

const courses = [
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'Fashion Designing',
    items: ['Basic to Advanced Fashion Designing', 'Boutique Management Course', 'Garment Designing & Customization', 'Practical Designing Techniques'],
  },
  {
    icon: <Scissors className="w-5 h-5" />,
    title: 'Embroidery & Aari Work',
    items: ['Aari Work Classes', 'Hand & Machine Embroidery', 'Advanced Embroidery Techniques', 'Blouse Embroidery Designing'],
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Traditional Art & Craft',
    items: ['Tanjavur Painting Classes', 'Tanjavur Painting on Blouse', 'Traditional Decorative Art'],
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Beauty & Fashion Skills',
    items: ['Hairstyle Classes', 'Mehendi Classes', 'Saree Kuchu Classes', 'Bridal Styling Techniques'],
  },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background font-sans"
    >
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-pink-900 via-purple-900 to-gray-950 text-white py-12 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,100,138,0.2),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.15),transparent_40%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp}>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-300 font-semibold block mb-3">Est. 2020 · Bengaluru</span>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              About <span className="text-pink-300">Radha Fashions</span>
            </h1>
            <div className="w-16 h-1 bg-pink-400 mx-auto mt-4 sm:mt-6 rounded" />
          </motion.div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <motion.div {...fadeUp} className="text-center space-y-4 sm:space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-500 font-semibold">Welcome</span>
          <h2 className="font-display text-xl sm:text-3xl font-black text-foreground tracking-wide">
            Where Traditional Craftsmanship Meets Modern Fashion
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Welcome to our fashion and boutique platform — a one-stop destination for beautiful fashion products,
            customized boutique designs, bridal services, embroidery, and professional fashion designing courses.
            We carefully select and create products that combine elegance, quality, creativity, and the latest fashion trends.
          </p>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Whether you are looking for a beautiful blouse, traditional bangles, an elegant saree, bridal accessories,
            or unique boutique products, we aim to make your shopping experience convenient and enjoyable.
          </p>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-pink-50 dark:bg-gray-900 border-y border-pink-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          {[
            { value: '5,000+', label: 'Happy Clients' },
            { value: '200+', label: 'Courses Completed' },
            { value: '50+', label: 'Bridal Events' },
            { value: '4.8★', label: 'Google Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="text-xl sm:text-3xl font-display font-black text-pink-500">{stat.value}</span>
              <span className="block text-[9px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Our Products */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-500 font-semibold block mb-2">What We Offer</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-wide">
              🛍️ Our Boutique Products
            </h2>
            <div className="w-10 h-0.5 bg-pink-400 mx-auto mt-4 rounded" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((product, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex items-center gap-3 p-4 rounded-xl bg-pink-50/50 dark:bg-gray-900 border border-pink-100 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 transition"
              >
                <ShoppingBag className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="text-sm text-foreground font-medium">{product}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Our Services */}
      <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-6 sm:mb-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-500 font-semibold block mb-2">Professional Services</span>
              <h2 className="font-display text-xl sm:text-3xl font-black text-foreground tracking-wide">
                👗 Our Boutique & Fashion Services
              </h2>
              <div className="w-10 h-0.5 bg-pink-400 mx-auto mt-4 rounded" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-gray-950 border border-border hover:border-pink-300 dark:hover:border-pink-700 transition shadow-sm"
                >
                  <Scissors className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground font-medium">{service}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bridal Services */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-6 sm:mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-500 font-semibold block mb-2">Special Occasions</span>
            <h2 className="font-display text-xl sm:text-3xl font-black text-foreground tracking-wide">
              👰 Bridal Services
            </h2>
            <div className="w-10 h-0.5 bg-pink-400 mx-auto mt-4 rounded" />
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto">
              Make your special occasions even more beautiful with our complete bridal beauty and fashion services.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bridalServices.map((service, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 border border-pink-100 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 transition"
              >
                <Crown className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="text-xs sm:text-sm text-foreground font-medium">{service}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Courses */}
      <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-6 sm:mb-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-500 font-semibold block mb-2">Learn & Grow</span>
              <h2 className="font-display text-xl sm:text-3xl font-black text-foreground tracking-wide">
                🎓 Fashion Designing Courses
              </h2>
              <div className="w-10 h-0.5 bg-pink-400 mx-auto mt-4 rounded" />
              <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto">
                Courses ranging from basic to advanced levels, suitable for beginners and experienced students alike.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {courses.map((course, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-950 border border-border shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500">
                      {course.icon}
                    </div>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-foreground tracking-wide">{course.title}</h3>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {course.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-pink-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Priority Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-6 sm:mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-500 font-semibold block mb-2">Our Commitment</span>
            <h2 className="font-display text-xl sm:text-3xl font-black text-foreground tracking-wide">
              ❤️ Students & Clients Are Our Priority
            </h2>
            <div className="w-10 h-0.5 bg-pink-400 mx-auto mt-4 rounded" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div variants={fadeUp} className="p-4 sm:p-6 rounded-2xl bg-pink-50/50 dark:bg-gray-900 border border-pink-100 dark:border-gray-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 mb-3 sm:mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2">For Our Clients</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We focus on understanding your requirements and delivering products and services that match your expectations.
                Quality, creativity, and customer satisfaction are at the heart of everything we do.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="p-4 sm:p-6 rounded-2xl bg-purple-50/50 dark:bg-gray-900 border border-purple-100 dark:border-gray-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-3 sm:mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2">For Our Students</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We provide practical knowledge, clear guidance, and skills that can be used in real-world fashion and boutique businesses.
                Build confidence to start your own fashion venture.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Vision */}
      <section className="bg-gradient-to-br from-pink-900 via-purple-900 to-gray-950 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-300 font-semibold block mb-3">Our Vision</span>
              <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wide mb-6">
                ✨ A Complete Fashion & Boutique Platform
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mx-auto mb-8">
                From buying a beautiful pair of bangles or a designer blouse to learning Aari work, embroidery,
                fashion designing, or boutique management — we aim to provide everything you need to explore
                and grow in the world of fashion.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {['Shop', 'Design', 'Learn', 'Create', 'Grow'].map((word) => (
                  <span key={word} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-display font-bold tracking-wider text-pink-300">
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-lg font-display font-bold text-white">
                Welcome to our fashion and boutique family! 💖
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
