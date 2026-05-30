import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = ({ variant = 'default' }) => {
    return (
        <div className={`skeleton-card skeleton-card-${variant}`}>
            {variant === 'hero' ? (
                <div className="skeleton-hero-content">
                    <div className="skeleton-meta skeleton-pulse"></div>
                    <div className="skeleton-title skeleton-pulse"></div>
                    <div className="skeleton-excerpt skeleton-pulse"></div>
                    <div className="skeleton-cta skeleton-pulse"></div>
                </div>
            ) : (
                <div className="skeleton-content">
                    <div className="skeleton-title skeleton-pulse"></div>
                    <div className="skeleton-meta skeleton-pulse"></div>
                    <div className="skeleton-excerpt skeleton-pulse"></div>
                </div>
            )}
            <div className="skeleton-image skeleton-pulse"></div>
        </div>
    );
};

export default SkeletonCard;
