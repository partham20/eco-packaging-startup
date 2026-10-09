import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-5xl text-forest">This box is empty.</h1>
      <p className="mt-3 text-ink/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
