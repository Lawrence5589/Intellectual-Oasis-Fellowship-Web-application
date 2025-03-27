import React, { useEffect, useState } from 'react';

function AdUnit({ 
  mobile = false,
  format = 'auto', 
  responsive = true, 
  style = { display: 'block' },
  minContentHeight = 500 // Minimum content height required to show ads
}) {
  const [shouldShowAd, setShouldShowAd] = useState(false);

  useEffect(() => {
    // Check if there's enough content to show ads
    const checkContentHeight = () => {
      const mainContent = document.querySelector('main, article, .content');
      if (mainContent) {
        const contentHeight = mainContent.offsetHeight;
        setShouldShowAd(contentHeight >= minContentHeight);
      }
    };

    // Initial check
    checkContentHeight();

    // Check on window resize
    window.addEventListener('resize', checkContentHeight);

    // Cleanup
    return () => window.removeEventListener('resize', checkContentHeight);
  }, [minContentHeight]);

  useEffect(() => {
    if (!shouldShowAd) return;

    try {
      // Check if adsbygoogle is defined
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    }
  }, [shouldShowAd]);

  if (!shouldShowAd) {
    return null;
  }

  return (
    <div className="ad-container my-8">
      <ins
        className="adsbygoogle"
        style={{
          ...style,
          minHeight: mobile ? '100px' : '250px',
          display: 'block',
          margin: '0 auto'
        }}
        data-ad-client="ca-pub-8130246277370920"
        data-ad-slot={mobile ? "5576020061" : "2542662619"}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}

export default AdUnit; 