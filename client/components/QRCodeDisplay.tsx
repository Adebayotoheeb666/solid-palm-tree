import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showUrl?: boolean;
  title?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 128,
  className = '',
  showUrl = false,
  title = 'QR Code'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#3839C9',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
        setQrCodeUrl(null);
      }
    };

    if (value) {
      generateQRCode();
    }
  }, [value, size]);

  if (error) {
    return (
      <div className={`flex items-center justify-center border-2 border-gray-300 bg-gray-100 ${className}`} 
           style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500 text-center px-2">
          QR Code Error
        </span>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className={`flex items-center justify-center border-2 border-gray-300 bg-gray-100 animate-pulse ${className}`} 
           style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      )}
      <img 
        src={qrCodeUrl} 
        alt={title}
        className="border border-gray-200 rounded-lg"
        style={{ width: size, height: size }}
      />
      {showUrl && (
        <p className="text-xs text-gray-500 mt-2 max-w-full break-all">
          {value}
        </p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
