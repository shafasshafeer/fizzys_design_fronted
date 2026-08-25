import React from 'react';
import './SizeGuide.css';

const sizes = [
  { label: 'XS', name: 'Extra Small' },
  { label: 'S', name: 'Small' },
  { label: 'M', name: 'Medium' },
  { label: 'L', name: 'Large' },
  { label: 'XL', name: 'Extra Large' },
  { label: 'XXL', name: 'Double XL' },
  { label: '3XL', name: 'Triple XL' },
  { label: '4XL', name: 'Quadruple XL' },
];

const SizeGuide = () => {
  return (
    <section className="size-guide">
      <div className="container">
        <h2 className="section-title">SHOP BY SIZE</h2>
        <div className="size-grid">
          {sizes.map((size, index) => (
            <div className="size-item" key={index}>
              <div className="size-circle">{size.label}</div>
              <span className="size-name">{size.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SizeGuide;