// app/page.tsx
async function getProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products', {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || []; // Ensure we get the array of products
  } catch (error) {
    console.error(error);
    return [];
  }
}

interface Product {
  id: string;
  name: string;
  description?: string;
  categories: { id: string; name: string }[];
  families?: { id: string; name: string };
}

export default async function Home() {
  const products: Product[] = await getProducts();

  // Log the response for debugging
  console.log('Fetched products:', products);

  if (!Array.isArray(products) || products.length === 0) {
    return <div className="container mx-auto p-4">No products found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <li key={product.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p>{product.description}</p>
            <p className="text-sm text-gray-600">
              Categories: {product.categories.map((cat) => cat.name).join(', ')}
            </p>
            {product.families && (
              <p className="text-sm text-gray-600">Family: {product.families.name}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}