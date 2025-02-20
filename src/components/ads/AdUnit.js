import React, { useEffect } from 'react';

function AdUnit({ 
  mobile = false,
  format = 'auto', 
  responsive = true, 
  style = { display: 'block' } 
}) {
  useEffect(() => {
    try {
      // Check if adsbygoogle is defined
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    }
  }, []);

  return (
    <div className="ad-container my-6">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-8130246277370920"
        data-ad-slot={mobile ? "5576020061" : "2542662619"}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}

export default AdUnit; 