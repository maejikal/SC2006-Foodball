import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './FAQContactPage.css';

export default function FAQContactPage() {

  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'What is 2ManyFoods?',
      answer: '2ManyFoods is a restaurant discovery and recommendation platform that helps you find the perfect place to eat based on your preferences, dietary restrictions, and cuisine choices.'
    },
    {
      id: 2,
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the navigation bar, fill in your details including email, username, and password, and you\'ll be ready to start exploring restaurants!'
    },
    {
      id: 3,
      question: 'How do I set my dietary preferences?',
      answer: 'After logging in, go to your Account page, then navigate to "Dietary Preferences" or "Cuisine Preferences". You can select your restrictions (halal, vegetarian, allergies) and rank your favorite cuisines.'
    },
    {
      id: 4,
      question: 'Can I leave reviews for restaurants?',
      answer: 'Yes! After visiting a restaurant, go to your Food History page and click "Review" next to any restaurant. You can rate it with stars (1-5), write a text review, and even upload photos or videos.'
    },
    {
      id: 5,
      question: 'How do I change my password?',
      answer: 'Go to your Account page, click on "Account & Security", then select "Change Password". You\'ll need to enter your current password and your new password.'
    },
    {
      id: 6,
      question: 'How do restaurant recommendations work?',
      answer: 'Our recommendation system uses your cuisine preferences, dietary restrictions, past reviews, and location to suggest restaurants you\'ll love. The more you use the app, the better the recommendations become!'
    },
    {
      id: 7,
      question: 'Can I use 2ManyFoods for free?',
      answer: 'Yes! 2ManyFoods is completely free to use. You can discover restaurants, leave reviews, and manage your food history at no cost.'
    }
  ];

  const toggleFAQ = (id) => {

    if (expandedFAQ === id) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(id);
    }
  };

  return (
    <div className="faqContactPage">
      <Navbar />
      
      <div className="faqContactContainer">
        <div className="pageHeader">
          <h1>Faq & Contact</h1>
          <p>Find answers to common questions and ways to reach us</p>
        </div>

        {/* FAQ SECTION */}
        <section className="faqSection">
          <h2>Frequently Asked Questions</h2>
          <p className="sectionSubtitle">Find quick answers to common questions</p>

          {/*FAQ List*/}
          <div className="faqList">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`faqItem ${expandedFAQ === faq.id ? 'expanded' : ''}`}
              >
                {/*FAQ button*/}
                <button 
                  className="faqQuestion"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={expandedFAQ === faq.id}
                >
                  <span>{faq.question}</span>

                  {/*Chevron icon*/}
                  <svg 
                    className="faqIcon"
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M6 9L12 15L18 9" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/*FAQ Answer*/}
                {expandedFAQ === faq.id && (
                  <div className="faqAnswer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/*CONTACT SECTION*/}
        <section className="contactSection">
        <h2>Contact Us</h2>
        <p className="sectionSubtitle">Get in touch with us</p>

        {/*Contact Methods*/}
        <div className="contactMethods">
            {/*Email Contact*/}
            <div className="contactMethod">
            <div className="contactIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.89 13.26C11.5196 13.6728 12.4804 13.6728 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="contactInfo">
                <h3>Email</h3>
                <p>support@2manyfoods.com</p>
            </div>
            </div>

            {/*Phone Contact*/}
            <div className="contactMethod">
            <div className="contactIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="contactInfo">
                <h3>Phone</h3>
                <p>+65 999999</p>
            </div>
            </div>
        </div>
        </section>

      </div>
    </div>
  );
}