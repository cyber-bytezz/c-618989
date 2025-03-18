
import Header from "../components/Header";
import AssetList from "../components/AssetList";

const Index = () => {
  return (
    <div className="min-h-screen bg-neo-gray">
      <Header />
      <main className="animate-slide-up">
        <div className="pt-8 pb-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Crypto Asset Tracker</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Track top cryptocurrencies ranked by market cap
          </p>
        </div>
        <AssetList />
      </main>
    </div>
  );
};

export default Index;
