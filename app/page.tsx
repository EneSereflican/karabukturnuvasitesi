import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1f12] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-sm border-b border-[#1a472a]" style={{ backgroundColor: 'rgba(13, 31, 18, 0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="4" fill="currentColor" />
              <path d="M16 2 L16 8 M16 24 L16 30" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 16 L8 16 M24 16 L30 16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <h1 className="text-xl font-bold hidden sm:block">Karabük Turnuvası</h1>
          </div>

          <div className="flex gap-3 items-center">
            <Link href="/admin/giris">
              <div className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm transition-colors">
                <Lock size={14} />
                <span>Admin</span>
              </div>
            </Link>
            <Link href="/basvuru-durumlari">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#0d1f12]">
                Başvuru Durumları
              </Button>
            </Link>
            <Link href="/basvuru/kaptan">
              <Button className="bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500]">
                Takım Oluştur
              </Button>
            </Link>
            <Link href="/oyuncu-basvuru">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#0d1f12]">
                Takıma Katıl
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20" style={{ backgroundImage: 'linear-gradient(rgba(13, 31, 18, 0.75), rgba(13, 31, 18, 0.85)), url(/foto-taraftarlar.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="text-center space-y-8 max-w-4xl">
          <div style={{
            display: 'inline-block',
            backgroundColor: '#f0a500',
            color: '#1a2e1d',
            fontWeight: '600',
            fontSize: '14px',
            padding: '6px 20px',
            borderRadius: '999px',
            marginBottom: '24px',
            whiteSpace: 'nowrap'
          }}>
            6. Bahar Futbol Turnuvası
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Karabük Kamu Kurum
            </h2>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              ve Kuruluşları Arası
            </h2>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight" style={{ color: '#f0a500' }}>
              Bahar Futbol Turnuvası
            </h2>
          </div>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto text-center leading-relaxed">
            Sporun kitlelere yayılması, spora ilginin artırılması, kamu kurumları
            ve sivil toplum kuruluşları arasındaki iletişimin saygı, sevgi, dostluk
            ve hoşgörü diyaloğuna dönüşmesi amacıyla düzenlenmektedir.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/basvuru/kaptan" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] text-lg py-6">
                Takım Olarak Başvur
              </Button>
            </Link>
            <Link href="/basvuru-durumlari" className="flex-1 sm:flex-none">
              <div style={{
                display: 'inline-block',
                border: '2px solid white',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                padding: '12px 28px',
                borderRadius: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                Başvuru Durumlarını Gör
              </div>
            </Link>
            <Link href="/oyuncu-basvuru" className="flex-1 sm:flex-none">
              <div style={{
                display: 'inline-block',
                border: '2px solid white',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                padding: '12px 28px',
                borderRadius: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                Takıma Katıl
              </div>
            </Link>
          </div>

          {/* Scroll down indicator */}
          <div className="pt-12 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto text-gray-400">
              <path d="M12 5v14m0 0l-7-7m7 7l7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0d1f12]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Turnuva Hakkında</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="bg-[#1a2e1d] border-[#1a472a] hover:border-[#f0a500] transition-colors">
              <CardHeader>
                <div className="text-5xl font-bold mb-4" style={{ color: '#f0a500' }}>15</div>
                <CardTitle className="text-white">Maksimum Oyuncu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Her takım en fazla 15, en az 10 oyuncudan oluşabilir.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-[#1a2e1d] border-[#1a472a] hover:border-[#f0a500] transition-colors">
              <CardHeader>
                <div className="text-5xl font-bold mb-4 text-[#f0a500]">⚽</div>
                <CardTitle className="text-white">Kimler Katılabilir?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Karabük'te görev yapan kamu kurumu çalışanları.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-[#1a2e1d] border-[#1a472a] hover:border-[#f0a500] transition-colors">
              <CardHeader>
                <div className="text-5xl font-bold mb-4 text-[#f0a500]">📋</div>
                <CardTitle className="text-white">Başvuru Nasıl Yapılır?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Takım sorumlusu önce kaydolur, ardından oyuncular davet linki ile başvurularını tamamlar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1a2e1d]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Başvuru Süreci</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Takım Oluştur',
                desc: 'Takım sorumlusu kurum ve takım bilgilerini girer, sistem otomatik takım anahtarı oluşturur.'
              },
              {
                step: 2,
                title: 'Anahtarı Paylaş',
                desc: 'Takım sorumlusu oluşan anahtarı takım üyelerine iletir.'
              },
              {
                step: 3,
                title: 'Oyuncular Kaydolur',
                desc: 'Oyuncular takım anahtarını kullanarak belgelerini yükler ve kayıt oluşturur.'
              },
              {
                step: 4,
                title: 'Admin Onaylar',
                desc: 'Yetkililer belgeleri inceleyip başvuruyu onaylar.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-4 text-[#0d1f12]"
                    style={{ backgroundColor: '#f0a500' }}
                  >
                    {item.step}
                  </div>

                  {/* Connector line for desktop */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-[#1a472a]" />
                  )}

                  <h3 className="text-lg font-semibold text-white text-center mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 text-center">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: 'linear-gradient(rgba(13, 31, 18, 0.80), rgba(13, 31, 18, 0.80)), url(/foto-kupalar.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Hemen Başvurun
          </h2>
          <p className="text-xl text-gray-300">
            Takımınızı oluşturun ve turnuvaya katılın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/basvuru/kaptan">
              <Button className="bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] text-lg py-6 px-8">
                Takım Başvurusu Oluştur
              </Button>
            </Link>
            <Link href="/oyuncu-basvuru">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#0d1f12] text-lg py-6 px-8">
                Takıma Katıl
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1f12] border-t border-[#1a472a] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <p className="text-gray-300">
              Karabük Kamu Kurumları Bahar Futbol Turnuvası 2026
            </p>
            <p className="text-sm text-gray-500">
              Tüm hakları saklıdır.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-center">
            <Link href="/basvuru/kaptan" className="text-[#f0a500] hover:text-[#e09500] transition-colors">
              Başvuru Yap
            </Link>
            <div className="hidden sm:block w-px h-6 bg-[#1a472a]" />
            <Link href="/basvuru-durumlari" className="text-[#f0a500] hover:text-[#e09500] transition-colors">
              Başvuru Durumları
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
