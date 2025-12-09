# Technical Documentation - NaijaMeds

## System Architecture

### Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Database      │
│   (React/TS)    │◄──►│   (Backend)     │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │  Vite   │             │  Auth   │             │   RLS   │
    │ (Build) │             │ Service │             │Policies │
    └─────────┘             └─────────┘             └─────────┘
```

## Component Architecture

### Component Hierarchy
```
App
├── Layout
│   ├── Header (Search, Auth, Navigation)
│   └── Main Content Area
├── MedicationSearch
│   └── Medication Cards
├── PharmacyCard
│   ├── Availability Status
│   ├── Price Information
│   └── Update Actions
├── Modals
│   ├── AuthModal
│   ├── AddPharmacyModal
│   └── UpdateAvailabilityModal
└── Hooks
    ├── useAuth
    └── Custom Data Hooks
```

## Database Design

### Entity Relationship Diagram
```
Users (1) ──── (Many) Pharmacies
Users (1) ──── (Many) Availability Updates
Pharmacies (1) ──── (Many) Availability Records
Medications (1) ──── (Many) Availability Records
Availability (1) ──── (Many) Moderation Flags
```

### Table Specifications

#### Users Table (Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Medications Table
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  generic_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_medications_generic_name ON medications(generic_name);
```

#### Pharmacies Table
```sql
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  hours TEXT DEFAULT '9:00 AM - 9:00 PM',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_pharmacies_name ON pharmacies(name);
CREATE INDEX idx_pharmacies_created_by ON pharmacies(created_by);
```

#### Availability Table
```sql
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  in_stock BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(10,2),
  last_updated TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(pharmacy_id, medication_id)
);

-- Indexes for performance
CREATE INDEX idx_availability_pharmacy_id ON availability(pharmacy_id);
CREATE INDEX idx_availability_medication_id ON availability(medication_id);
CREATE INDEX idx_availability_last_updated ON availability(last_updated);
```

#### Moderation Flags Table
```sql
CREATE TABLE moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id UUID NOT NULL REFERENCES availability(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_moderation_flags_availability_id ON moderation_flags(availability_id);
CREATE INDEX idx_moderation_flags_resolved ON moderation_flags(resolved);
```

## Security Implementation

### Row Level Security Policies

#### Medications Table
```sql
-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Anyone can read medications
CREATE POLICY "Anyone can read medications" ON medications
  FOR SELECT TO public USING (true);

-- Authenticated users can create medications
CREATE POLICY "Authenticated users can create medications" ON medications
  FOR INSERT TO authenticated WITH CHECK (true);
```

#### Pharmacies Table
```sql
-- Enable RLS
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Anyone can read pharmacies
CREATE POLICY "Anyone can read pharmacies" ON pharmacies
  FOR SELECT TO public USING (true);

-- Authenticated users can create pharmacies
CREATE POLICY "Authenticated users can create pharmacies" ON pharmacies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
```

#### Availability Table
```sql
-- Enable RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Anyone can read availability
CREATE POLICY "Anyone can read availability" ON availability
  FOR SELECT TO public USING (true);

-- Authenticated users can update availability
CREATE POLICY "Authenticated users can update availability" ON availability
  FOR ALL TO authenticated USING (true) WITH CHECK (auth.uid() = updated_by);
```

#### Moderation Flags Table
```sql
-- Enable RLS
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read unresolved flags
CREATE POLICY "Anyone can read unresolved flags" ON moderation_flags
  FOR SELECT TO public USING (NOT resolved);

-- Authenticated users can create flags
CREATE POLICY "Authenticated users can create flags" ON moderation_flags
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = flagged_by);
```

## API Design Patterns

### Supabase Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Query Patterns

#### Fetch with Relationships
```typescript
const { data, error } = await supabase
  .from('availability')
  .select(`
    *,
    pharmacy:pharmacies(*),
    medication:medications(*)
  `)
  .eq('medication_id', medicationId);
```

#### Upsert Pattern
```typescript
const { data, error } = await supabase
  .from('availability')
  .upsert({
    pharmacy_id: pharmacyId,
    medication_id: medicationId,
    in_stock: inStock,
    price: price,
    updated_by: userId
  }, {
    onConflict: 'pharmacy_id,medication_id'
  });
```

## State Management

### Authentication State
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, signUp, signIn, signOut };
}
```

### Data Fetching Patterns
```typescript
const [medications, setMedications] = useState<Medication[]>([]);
const [loading, setLoading] = useState(false);

const fetchMedications = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching medications:', error);
  } else {
    setMedications(data || []);
  }
  setLoading(false);
};
```

## Performance Optimizations

### Frontend Optimizations

#### Component Memoization
```typescript
const PharmacyCard = React.memo(({ pharmacy, availability, onUpdate }) => {
  // Component implementation
});
```

#### Debounced Search
```typescript
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### Database Optimizations

#### Efficient Queries
```sql
-- Use indexes for fast lookups
EXPLAIN ANALYZE SELECT * FROM medications WHERE name ILIKE '%panadol%';

-- Limit results for pagination
SELECT * FROM pharmacies ORDER BY name LIMIT 20 OFFSET 0;

-- Use specific columns instead of SELECT *
SELECT id, name, address FROM pharmacies WHERE city = 'Lagos';
```

## Error Handling

### Frontend Error Handling
```typescript
const handleApiCall = async () => {
  try {
    const { data, error } = await supabaseOperation();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Operation failed:', error);
    setErrorMessage(error.message);
    return null;
  }
};
```

### Form Validation
```typescript
const validateForm = (data: FormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!data.address.trim()) {
    errors.address = 'Address is required';
  }
  
  if (data.phone && !isValidPhoneNumber(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  return errors;
};
```

## Testing Strategy

### Unit Testing Setup
```typescript
// Example test for utility functions
describe('formatPrice', () => {
  it('should format Nigerian Naira correctly', () => {
    expect(formatPrice(1500.50)).toBe('₦1,500.50');
    expect(formatPrice(null)).toBe('Price not available');
  });
});
```

### Integration Testing
```typescript
// Example test for API integration
describe('Medication API', () => {
  it('should fetch medications successfully', async () => {
    const medications = await fetchMedications();
    expect(medications).toBeInstanceOf(Array);
    expect(medications.length).toBeGreaterThan(0);
  });
});
```

## Deployment Configuration

### Environment Variables
```bash
# .env.example
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

## Monitoring & Analytics

### Performance Monitoring
```typescript
// Track page load times
const trackPageLoad = () => {
  const loadTime = performance.now();
  console.log(`Page loaded in ${loadTime}ms`);
};
```

### User Analytics
```typescript
// Track user interactions
const trackUserAction = (action: string, data?: any) => {
  console.log(`User action: ${action}`, data);
  // Send to analytics service
};
```

## Scalability Considerations

### Database Scaling
- **Read Replicas**: For handling increased read traffic
- **Connection Pooling**: Managed by Supabase
- **Query Optimization**: Regular EXPLAIN ANALYZE reviews
- **Indexing Strategy**: Composite indexes for complex queries

### Frontend Scaling
- **Code Splitting**: Dynamic imports for route-based splitting
- **CDN Integration**: Static asset delivery optimization
- **Caching Strategy**: Browser caching and service workers
- **Bundle Optimization**: Tree shaking and minification

## Security Best Practices

### Data Protection
- **Input Sanitization**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookies and CSRF tokens

### Authentication Security
- **Password Hashing**: Handled by Supabase Auth
- **Session Management**: Secure JWT tokens
- **Rate Limiting**: API call throttling
- **Account Verification**: Email verification for new accounts

## Maintenance & Updates

### Code Maintenance
- **Regular Dependencies Updates**: Keep packages current
- **Code Reviews**: Peer review process
- **Documentation Updates**: Keep docs synchronized with code
- **Performance Audits**: Regular performance assessments

### Database Maintenance
- **Regular Backups**: Automated daily backups
- **Index Maintenance**: Monitor and optimize indexes
- **Data Cleanup**: Remove obsolete records
- **Performance Monitoring**: Query performance tracking