'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FAQ() {
  const faqs = [
    {
      question: 'Where do the cooking classes take place?',
      answer: 'The classes take place at Cátia\'s home kitchen in Fonte Francês, Mindelo. When included in the class, we meet first for a guided tour of the Municipal Market and Fish Market, followed by traditional local transport to Cátia\'s home. Exact directions are sent upon booking confirmation.'
    },
    {
      question: 'Do I need prior cooking experience?',
      answer: 'Not at all! Our classes welcome everyone, from total beginners who have never fried an egg to passionate foodies who want to master authentic Cape Verdean techniques and spice combinations.'
    },
    {
      question: 'How does payment work?',
      answer: 'No online payment or credit card is required when booking. Payment is made in person on the day of the class, in cash (Cape Verdean Escudos CVE or Euros €).'
    },
    {
      question: 'Are meals and drinks included?',
      answer: 'Yes! At the end of each cooking class, we all sit down together at the family table to savor the feast we prepared, accompanied by wine, local grogue or pontche, and dessert.'
    },
    {
      question: 'What is the maximum group size?',
      answer: 'To ensure an intimate, hands-on atmosphere with personalized attention for every guest, our classes are limited to a maximum of 8 participants.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-18 md:py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-6 sm:mb-8">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know before joining us around the table.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
            >
              <button
                className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-mindelo-dark pr-8">{faq.question}</span>
                <ChevronDown 
                  className={`text-mindelo-blue transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
