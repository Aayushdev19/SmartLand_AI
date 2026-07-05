// Mock data for SmartLand AI platform

export const mockPredictionResult = {
  predictedPrice: 4250000,
  jantriValue: 3800000,
  differencePercent: 11.8,
  confidenceScore: 87,
  investmentRating: 8.2,
  riskLevel: 'Low',
  pricePerSqFt: 2833,
  forecast: {
    '1yr': 4675000,
    '3yr': 5312500,
    '5yr': 6120000,
    '10yr': 8500000,
  },
  growthRate: {
    '1yr': 10,
    '3yr': 25,
    '5yr': 44,
    '10yr': 100,
  },
};

export const mockAreaTrends = [
  { month: 'Jan', marketPrice: 3800000, jantriRate: 3400000 },
  { month: 'Feb', marketPrice: 3920000, jantriRate: 3400000 },
  { month: 'Mar', marketPrice: 3850000, jantriRate: 3400000 },
  { month: 'Apr', marketPrice: 4050000, jantriRate: 3800000 },
  { month: 'May', marketPrice: 4180000, jantriRate: 3800000 },
  { month: 'Jun', marketPrice: 4250000, jantriRate: 3800000 },
];

export const mockForecastData = [
  { year: '2024', price: 4250000 },
  { year: '2025', price: 4675000 },
  { year: '2026', price: 4940000 },
  { year: '2027', price: 5312500 },
  { year: '2029', price: 6120000 },
  { year: '2034', price: 8500000 },
];

export const mockProperties = [
  {
    id: 1,
    name: 'Satellite Area, Ahmedabad',
    area: 1500,
    type: 'Residential',
    predictedPrice: 4250000,
    jantriRate: 3800000,
    investmentScore: 8.2,
    growth: '+10%',
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    id: 2,
    name: 'Prahlad Nagar, Ahmedabad',
    area: 1200,
    type: 'Commercial',
    predictedPrice: 6800000,
    jantriRate: 5900000,
    investmentScore: 9.1,
    growth: '+14%',
    lat: 23.0065,
    lng: 72.5064,
  },
  {
    id: 3,
    name: 'Bopal, Ahmedabad',
    area: 1800,
    type: 'Residential',
    predictedPrice: 3200000,
    jantriRate: 2900000,
    investmentScore: 7.5,
    growth: '+8%',
    lat: 23.0395,
    lng: 72.4638,
  },
];

export const mockAnalyticsData = {
  topAreas: [
    { name: 'Prahlad Nagar', score: 9.1, growth: 14, avgPrice: 5667 },
    { name: 'Satellite', score: 8.2, growth: 10, avgPrice: 2833 },
    { name: 'SG Highway', score: 8.8, growth: 12, avgPrice: 3900 },
    { name: 'Bodakdev', score: 8.5, growth: 11, avgPrice: 4200 },
    { name: 'Bopal', score: 7.5, growth: 8, avgPrice: 1778 },
  ],
  monthlyVolume: [
    { month: 'Jan', transactions: 245 },
    { month: 'Feb', transactions: 312 },
    { month: 'Mar', transactions: 289 },
    { month: 'Apr', transactions: 378 },
    { month: 'May', transactions: 421 },
    { month: 'Jun', transactions: 395 },
  ],
  propertyTypeDistribution: [
    { type: 'Residential', value: 58 },
    { type: 'Commercial', value: 24 },
    { type: 'Agricultural', value: 12 },
    { type: 'Industrial', value: 6 },
  ],
};

export const nearbyAmenities = [
  { type: 'school', name: 'Delhi Public School', distance: '0.8 km', icon: '🏫' },
  { type: 'hospital', name: 'Apollo Hospital', distance: '1.2 km', icon: '🏥' },
  { type: 'bank', name: 'SBI Branch', distance: '0.4 km', icon: '🏦' },
  { type: 'transport', name: 'Bus Stand', distance: '0.3 km', icon: '🚌' },
  { type: 'mall', name: 'Iscon Mall', distance: '2.1 km', icon: '🛍️' },
  { type: 'park', name: 'Riverfront Park', distance: '1.5 km', icon: '🌳' },
];

export const propertyTypes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Plot'];
export const constructionTypes = ['RCC Frame', 'Brick Masonry', 'Steel Frame', 'Load Bearing', 'Under Construction'];
export const gujaratCities = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad',
  'Bharuch', 'Mehsana', 'Morbi', 'Surendranagar', 'Botad',
];
