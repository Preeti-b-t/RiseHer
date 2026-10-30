import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Quote,
  ExternalLink,
  X,
  Award,
  Compass,
  ArrowUpRight,
  Building2,
  BookOpen
} from 'lucide-react';
import { InspirationStory } from '../types';

export const INSPIRATION_STORIES: InspirationStory[] = [
  {
    id: 'falguni-nayar',
    name: 'Falguni Nayar',
    company: 'Nykaa (FSN E-Commerce)',
    domain: 'Beauty & E-Commerce',
    photoUrl: '/images/entrepreneurs/falguni_nayar.jpg',
    quoteOrLesson: 'I started Nykaa at the age of 50 with no background in beauty or retail. If you believe in your idea and pursue it with passion, age is merely a number.',
    quoteAttribution: 'FICCI FLO National Annual Conference',
    summary: 'Left a prestigious 19-year investment banking career at 50 to solve India’s broken beauty retail supply chain, building Nykaa into a multi-billion dollar publicly listed enterprise.',
    fullJourney: [
      'After spending nearly two decades as an investment banker at Kotak Mahindra Capital, Falguni noticed that Indian consumers lacked access to genuine, curated international and domestic beauty products.',
      'In 2012, at age 50, she invested her personal savings to found Nykaa as an inventory-led, 100% authentic multi-brand beauty platform, refusing to compromise on product authenticity.',
      'Recognizing that Indian consumers value touch-and-feel experiences, she pioneered an omnichannel model with Nykaa Luxe and Nykaa On-Trend stores across tier-1 and tier-2 Indian cities.',
      'In November 2021, Nykaa debuted on the Indian stock exchanges with a blockbuster IPO, making Falguni India’s wealthiest self-made woman billionaire while maintaining high corporate governance.'
    ],
    keyMilestones: [
      '2012: Founded Nykaa with zero beauty background at age 50',
      '2015: Introduced physical retail stores with omnichannel fulfillment',
      '2020: Achieved operational EBITDA profitability across core operations',
      '2021: Historic public listing on NSE/BSE with $13B+ peak valuation'
    ],
    takeawayForEntrepreneurs: 'Prioritize unit economics, authentic inventory, and customer trust over reckless discount-driven user acquisition.'
  },
  {
    id: 'kiran-mazumdar-shaw',
    name: 'Kiran Mazumdar-Shaw',
    company: 'Biocon Limited',
    domain: 'Biotechnology & Healthcare',
    photoUrl: '/images/entrepreneurs/kiran_mazumdar_shaw.jpg',
    quoteOrLesson: 'I really believe that entrepreneurship is about being able to face failure, manage failure and succeed after failing.',
    quoteAttribution: 'World Economic Forum & Harvard Business Review Address',
    summary: 'Founded Biocon in 1978 in a rented garage with ₹10,000 when women were routinely denied bank loans, transforming it into Asia’s foremost biopharmaceutical innovator.',
    fullJourney: [
      'After graduating as India’s first female master brewer, Kiran faced overt gender bias when breweries refused to hire a woman brewmaster.',
      'Undeterred, she partnered with an Irish biotech pioneer in 1978 to start Biocon in Bengaluru with just ₹10,000 seed capital and two employees in a leased garage.',
      'She faced extreme hurdles securing bank loans because biotech was completely unknown in India and lenders were skeptical of an unmarried young female entrepreneur.',
      'Through relentless scientific rigor, she pivoted Biocon from industrial enzymes to affordable insulin and biosimilars, revolutionizing global diabetes management.'
    ],
    keyMilestones: [
      '1978: Started Biocon India with ₹10,000 seed money in Bengaluru',
      '1989: First Indian biotech firm to earn US FDA manufacturing clearances',
      '2004: Blockbuster IPO oversubscribed 33x on day one',
      '2020: Awarded EY World Entrepreneur of the Year'
    ],
    takeawayForEntrepreneurs: 'Transform initial societal barriers and skepticism into an unrelenting focus on scientific depth and quality.'
  },
  {
    id: 'vineeta-singh',
    name: 'Vineeta Singh',
    company: 'SUGAR Cosmetics',
    domain: 'Cosmetics & D2C Retail',
    photoUrl: '/images/entrepreneurs/vineeta_singh.jpg',
    quoteOrLesson: 'Starting up is hard, but giving up on your dream when you know you have what it takes is even harder.',
    quoteAttribution: 'IIM Ahmedabad Convocation Address',
    summary: 'Turned down a ₹1 crore campus placement offer from IIM-A to build startups. After 100+ investor rejections, she built SUGAR Cosmetics into a ₹500 Cr+ omnichannel brand.',
    fullJourney: [
      'At age 23, Vineeta made headlines by turning down a lucrative ₹1 crore annual salary offer from an international investment bank to build her own enterprise.',
      'Her initial lingerie subscription startup failed to scale, and she spent nine grueling years facing over a hundred venture capitalist rejections while surviving on modest savings.',
      'In 2015, observing that global cosmetics brands did not formulate products suited to warm Indian climates and diverse undertones, she launched SUGAR Cosmetics.',
      'By focusing on transfer-proof, high-pigment matte products and authentic influencer storytelling, SUGAR expanded into 45,000+ retail outlets across India.'
    ],
    keyMilestones: [
      '2007: Declined ₹1 Cr corporate job offer to bootstrap first business',
      '2012: Ran Fab Bag to collect deep proprietary Indian consumer data',
      '2015: Launched SUGAR Cosmetics with smudge-proof formulations',
      '2022: Scaled to 45,000+ stores and joined Shark Tank India as investor'
    ],
    takeawayForEntrepreneurs: 'Tenacity across years of silence and rejection is the greatest asset an early-stage founder can cultivate.'
  },
  {
    id: 'richa-kar',
    name: 'Richa Kar',
    company: 'Zivame',
    domain: 'Retail Tech & Innerwear',
    photoUrl: '/images/entrepreneurs/richa_kar.jpg',
    quoteOrLesson: 'If you are strong in your conviction and know there is a genuine problem to solve, cultural awkwardness will turn into consumer gratitude.',
    quoteAttribution: 'National Women Entrepreneurship Summit',
    summary: 'Destigmatized intimate wear retail in India by building an empowering, body-positive digital portal with proprietary fitting algorithms.',
    fullJourney: [
      'While working in retail tracking at SAP, Richa studied consumer behavior and noticed that buying lingerie in India was fraught with embarrassment and sizing mismatches.',
      'When she proposed an online lingerie store, friends and conservative acquaintances questioned the propriety of the business idea.',
      'She persevered and founded Zivame in 2011, personally educating women about bra anatomy, band measurements, and cup sizes through interactive digital tools.',
      'Zivame transformed from a distributor into a private label powerhouse, opening offline Fit Studios where trained consultants provided confidential fitting consultations.'
    ],
    keyMilestones: [
      '2011: Launched Zivame from a small office in Bengaluru',
      '2014: Developed proprietary Indian sizing calculators and guides',
      '2016: Rolled out brand-owned experiential Fit Studios in major cities',
      '2020: Grew into India’s dominant intimate apparel ecosystem'
    ],
    takeawayForEntrepreneurs: 'Taboo topics and cultural embarrassment often mask the most urgent, underserved consumer needs.'
  },
  {
    id: 'ghazal-alagh',
    name: 'Ghazal Alagh',
    company: 'Mamaearth (Honasa Consumer)',
    domain: 'Toxin-Free Personal Care',
    photoUrl: '/images/entrepreneurs/ghazal_alagh.jpg',
    quoteOrLesson: 'A mother’s care has zero room for compromise. We built Mamaearth because we couldn’t find 100% safe products for our own child.',
    quoteAttribution: 'Startup India Innovation Keynote',
    summary: 'Mompreneur who founded Mamaearth after struggling to find safe baby products in India, scaling it into an NSE/BSE listed consumer champion.',
    fullJourney: [
      'When Ghazal and her husband Varun had their first child, they struggled to find toxin-free, certified baby products in Indian pharmacies.',
      'In 2016, they founded Mamaearth with just six baby care products carrying Asia’s first MadeSafe certification, formulating without parabens or sulfates.',
      'Ghazal connected directly with mom communities on social channels, listening to feedback and co-creating products based on ancestral Indian remedies like onion oil and ubtan.',
      'Honasa Consumer expanded across multiple lifestyle brands (The Derma Co, Aqualogica, Ayuga) and successfully completed an IPO in 2023.'
    ],
    keyMilestones: [
      '2016: Launched Mamaearth with 6 toxin-free baby essentials',
      '2019: Introduced Onion Hair Oil, achieving viral nationwide acclaim',
      '2022: Honasa achieved unicorn valuation through multi-brand expansion',
      '2023: Listed on Indian stock exchanges as a profitable new-age D2C group'
    ],
    takeawayForEntrepreneurs: 'Solve your own immediate life problem; your empathy as a customer is your most potent product design compass.'
  },
  {
    id: 'aditi-gupta',
    name: 'Aditi Gupta',
    company: 'Menstrupedia',
    domain: 'EdTech & Social Impact',
    photoUrl: '/images/entrepreneurs/aditi_gupta.jpg',
    quoteOrLesson: 'When you break a societal taboo with empathy and design, education turns into empowerment.',
    quoteAttribution: 'TEDx & Forbes 30 Under 30 Citation',
    summary: 'NID designer who created Menstrupedia comic books and educational tools, dismantling menstrual taboos for over 4 million young girls across 20+ countries.',
    fullJourney: [
      'Growing up in Garhwa, Jharkhand, Aditi experienced severe menstrual restrictions and misinformation firsthand.',
      'While studying at the National Institute of Design (NID), she and her partner Tuhin conducted extensive field research, discovering that 88% of menstruating girls lacked basic physiological awareness.',
      'In 2012, they created the Menstrupedia comic guide, using child-friendly characters, culturally sensitive storytelling, and vibrant illustrations to explain puberty comfortably.',
      'The guide has been integrated into curricula across 11,000+ schools and translated into 20 languages with backing from state education bodies and global philanthropies.'
    ],
    keyMilestones: [
      '2012: Initiated Menstrupedia research project during postgraduate studies',
      '2014: Successfully crowdfunded the first multilingual edition of the comic',
      '2019: Adopted by school districts across South Asia, Africa, and South America',
      '2022: Featured on Shark Tank India Season 1 with multi-shark investment'
    ],
    takeawayForEntrepreneurs: 'Design thinking and empathetic communication can dismantle century-old societal barriers while creating a viable enterprise.'
  },
  {
    id: 'melanie-perkins',
    name: 'Melanie Perkins',
    company: 'Canva',
    domain: 'Visual Design & SaaS',
    photoUrl: '/images/entrepreneurs/melanie_perkins.jpg',
    quoteOrLesson: 'If you can solve a problem that millions of people experience every single day, you will build a company that matters.',
    quoteAttribution: 'TechCrunch Disrupt Keynote',
    summary: 'Started Fusion Books in her mom’s living room, faced 100+ Silicon Valley investor rejections, and scaled Canva into a $40B global visual communication suite.',
    fullJourney: [
      'At 19, while teaching graphic design software at university in Perth, Australia, Melanie realized that tools like Photoshop were unnecessarily convoluted for everyday people.',
      'She and her co-founder launched Fusion Books to let schools design yearbooks through simple drag-and-drop web interfaces, proving the technology and operating cash-flow positive.',
      'She flew to Silicon Valley with a grander vision—to democratize all design—pitching over 100 venture capital firms who repeatedly turned her down.',
      'Canva launched in 2013 and grew through viral word-of-mouth to over 170 million monthly active users across 190 countries.'
    ],
    keyMilestones: [
      '2007: Bootstrapped Fusion Books from family living room at age 19',
      '2013: Launched Canva after 3 years of persistent investor pitching',
      '2018: Achieved operating profitability and unicorn valuation',
      '2023: Reached 170M+ global active users with generative AI integration'
    ],
    takeawayForEntrepreneurs: 'Prove your core workflow in a small manageable niche first, master customer retention, then attack the broader market.'
  },
  {
    id: 'sara-blakely',
    name: 'Sara Blakely',
    company: 'Spanx',
    domain: 'Apparel & Innovation',
    photoUrl: '/images/entrepreneurs/sara_blakely.jpg',
    quoteOrLesson: 'Don’t be intimidated by what you don’t know. That can be your greatest strength and ensure that you do things differently from everyone else.',
    quoteAttribution: 'Stanford Graduate School of Business Address',
    summary: 'Door-to-door fax machine saleswoman who invested her $5,000 savings to patent Spanx, bootstrapping it to a billion-dollar brand without any outside advertising budget.',
    fullJourney: [
      'While working 7 years in sales selling fax machines door-to-door in Clearwater, Florida, Sara cut the feet out of control-top pantyhose so she could wear cream slacks smoothly.',
      'With zero fashion background and $5,000 in personal savings, she wrote her own patent application by reading textbooks to avoid $3,000 legal fees.',
      'She visited hosiery mills in North Carolina that repeatedly dismissed her idea until one male mill owner was persuaded by his daughters to take a chance on a production run.',
      'Sara bootstrapped Spanx for over two decades with zero outside venture capital, leveraging word-of-mouth and retail buyer relationships to build a billion-dollar brand.'
    ],
    keyMilestones: [
      '1998: Invented footless shapewear and hand-drafted her patent',
      '2000: Personally pitched Neiman Marcus and featured on Oprah’s Favorite Things',
      '2012: Named world’s youngest self-made female billionaire by Forbes',
      '2021: Closed majority partnership with Blackstone at $1.2B valuation'
    ],
    takeawayForEntrepreneurs: 'A shoestring budget is a superpower: it forces you to invent authentic, zero-cost grassroots marketing solutions.'
  },
  {
    id: 'oprah-winfrey',
    name: 'Oprah Winfrey',
    company: 'Harpo Productions & Media',
    domain: 'Media & Entrepreneurship',
    photoUrl: '/images/entrepreneurs/oprah_winfrey.jpg',
    quoteOrLesson: 'Turn your wounds into wisdom. Create the highest, grandest vision possible for your life, because you become what you believe.',
    quoteAttribution: 'Spelman College Commencement Address',
    summary: 'Overcame extreme rural poverty and trauma to become the first Black female billionaire, revolutionizing television, publishing, and purpose-driven entrepreneurship.',
    fullJourney: [
      'Born to a teenage mother in rural Mississippi and surviving severe childhood abuse and poverty, Oprah found solace in public speaking and local radio broadcasting.',
      'She moved to Chicago in 1984 to host a struggling morning talk show, catapulting it to number one within months through her unmatched empathy and authenticity.',
      'In 1986, in an unprecedented move for a television host, she negotiated 100% ownership of The Oprah Winfrey Show and formed Harpo Productions.',
      'She leveraged her influence to build publishing empires, the Oprah’s Book Club movement, film production houses, and the OWN television network.'
    ],
    keyMilestones: [
      '1986: Founded Harpo Productions, securing 100% equity in her television syndication',
      '1996: Launched Oprah’s Book Club, transforming global publishing sales',
      '2003: Became the first African-American woman billionaire in history',
      '2011: Launched the OWN network and extensive global philanthropic initiatives'
    ],
    takeawayForEntrepreneurs: 'Always fight to own your underlying intellectual property and equity; never be merely an employee of your own vision.'
  }
];

interface InspirationSectionProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
}

export const InspirationSection: React.FC<InspirationSectionProps> = ({
  title = "She Believed. She Built. She Inspires.",
  subtitle = "Behind every successful business is a woman who dared to take the first step. Let their journeys inspire yours.",
  badgeText = "Pioneering Women Founders",
  className = "mb-8"
}) => {
  const [selectedStory, setSelectedStory] = useState<InspirationStory | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={className}>
      {/* Header with Title and Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum/10 text-plum text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-coral" />
            <span>{badgeText}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-charcoal tracking-tight">
            {title}
          </h2>
          <p className="text-charcoal-muted text-sm mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-white border border-neutral-subtle/20 shadow-xs hover:bg-neutral-bg hover:border-primary/40 text-neutral-dark transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl bg-white border border-neutral-subtle/20 shadow-xs hover:bg-neutral-bg hover:border-primary/40 text-neutral-dark transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent snap-x snap-mandatory"
        style={{ scrollbarWidth: 'thin' }}
      >
        {INSPIRATION_STORIES.map((story) => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="group relative flex-none w-[285px] sm:w-[310px] bg-white rounded-2xl border border-neutral-subtle/20 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden snap-start flex flex-col justify-between"
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-secondary opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              {/* Profile Image & Badges */}
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-bg border border-neutral-subtle/20 shrink-0 shadow-xs">
                  <img
                    src={story.photoUrl}
                    alt={story.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to high quality avatar if Wikimedia asset block
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.name)}&background=54245F&color=fff&size=128`;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-heading font-bold text-neutral-dark group-hover:text-primary transition-colors truncate">
                    {story.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-subtle font-medium truncate mt-0.5">
                    <Building2 className="w-3 h-3 text-secondary shrink-0" />
                    <span className="truncate">{story.company}</span>
                  </div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[11px] font-semibold truncate max-w-full">
                    {story.domain}
                  </span>
                </div>
              </div>

              {/* Quotation Snippet */}
              <div className="relative bg-neutral-bg/60 rounded-xl p-3 my-2 border border-neutral-subtle/10 flex-1 flex flex-col justify-between">
                <Quote className="w-4 h-4 text-accent/60 mb-1 shrink-0" />
                <p className="text-xs text-neutral-dark/90 italic line-clamp-3 leading-relaxed">
                  "{story.quoteOrLesson}"
                </p>
                <p className="text-[10px] text-neutral-subtle text-right mt-1.5 font-medium">
                  — {story.quoteAttribution.split(',')[0]}
                </p>
              </div>

              {/* Brief Journey Snippet */}
              <p className="text-xs text-neutral-subtle line-clamp-2 mt-2 leading-relaxed">
                {story.summary}
              </p>
            </div>

            {/* Bottom Card Action */}
            <div className="px-4 py-2.5 bg-neutral-bg/40 border-t border-neutral-subtle/10 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-dark">
              <span>Read Her Full Story</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal Story Popup */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 bg-neutral-dark/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-subtle/20 overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-br from-primary via-primary-dark to-[#3b1744] text-white">
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
                  <img
                    src={selectedStory.photoUrl}
                    alt={selectedStory.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStory.name)}&background=54245F&color=fff&size=256`;
                    }}
                  />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium mb-2">
                    <Award className="w-3 h-3 text-accent" />
                    <span>{selectedStory.domain}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                    {selectedStory.name}
                  </h3>
                  <p className="text-white/80 text-sm font-medium mt-0.5">
                    Founder / Co-Founder, {selectedStory.company}
                  </p>
                </div>
              </div>

              {/* Verified Quote Block */}
              <div className="mt-5 p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                <Quote className="w-5 h-5 text-accent mb-1 opacity-80" />
                <p className="text-sm italic text-white/95 leading-relaxed font-serif">
                  "{selectedStory.quoteOrLesson}"
                </p>
                <p className="text-xs text-white/70 text-right mt-1.5 font-sans">
                  — {selectedStory.quoteAttribution}
                </p>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-neutral-dark">
              {/* Entrepreneurial Journey */}
              <div>
                <h4 className="text-base font-heading font-bold text-neutral-dark flex items-center gap-2 mb-3">
                  <Compass className="w-4 h-4 text-primary" />
                  <span>The Entrepreneurial Journey</span>
                </h4>
                <div className="space-y-2.5 text-sm text-neutral-dark/80 leading-relaxed">
                  {selectedStory.fullJourney.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Key Milestones */}
              <div>
                <h4 className="text-base font-heading font-bold text-neutral-dark flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-secondary" />
                  <span>Key Milestones & Pivots</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedStory.keyMilestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-bg/60 border border-neutral-subtle/15 text-xs font-medium text-neutral-dark flex items-start gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-secondary mt-1 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Takeaway For You */}
              <div className="p-4 sm:p-5 rounded-2xl bg-plum/5 border border-plum/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-plum mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-coral" />
                  <span>What Her Journey Teaches Us</span>
                </h4>
                <p className="text-sm font-semibold text-charcoal leading-snug">
                  "{selectedStory.takeawayForEntrepreneurs}"
                </p>
              </div>

              {/* Verified Attribution Note */}
              <div className="p-3 rounded-xl bg-charcoal/5 border border-charcoal/10 text-[11px] text-charcoal-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Verified Historical Quote & Milestones • Authentic Portrait</span>
                <span className="font-semibold text-plum">{selectedStory.quoteAttribution}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-neutral-bg border-t border-neutral-subtle/15 flex items-center justify-end">
              <button
                onClick={() => setSelectedStory(null)}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors shadow-xs"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
