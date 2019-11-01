interface Customer {
  name: string;
  company?: {
    name: string;
    address?: {
      city: string;
    };
  };
}

declare const customer: Customer;

// Write `get` function which returns the value fo a deeply nested property in a type-safe way.
// get(customer, 'company', 'address', 'city'): string | undefined
// Bonus: allow to pass a default value
