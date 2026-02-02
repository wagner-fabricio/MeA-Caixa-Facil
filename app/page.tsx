import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MessageSquare, BarChart3, Bell } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-cyan/20 via-white to-primary-navy/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="M&A Caixa Fácil"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold text-primary-navy">
            M&A <span className="text-primary-cyan">Caixa Fácil</span>
          </span>
        </div>
        <Link
          href="/login"
          className="px-6 py-2 text-primary-navy hover:text-primary-cyan transition-colors font-medium bg-white/50 backdrop-blur-sm rounded-full"
        >
          Entrar
        </Link>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-primary-navy mb-6 leading-tight drop-shadow-sm">
          Controle do caixa <br />
          <span className="text-primary-cyan">sem complicação</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
          Registre entradas e saídas falando ou digitando.
          <br />
          O Caixa Fácil mostra tudo — sem planilhas, sem dor de cabeça.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-primary-navy text-white rounded-xl font-semibold text-lg hover:bg-primary-navy/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 min-w-[200px] justify-center transform hover:-translate-y-1"
          >
            Começar Grátis
            <ArrowRight className="w-5 h-5 text-primary-cyan" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-primary-navy border-2 border-primary-navy rounded-xl font-semibold text-lg hover:bg-primary-navy hover:text-white transition-all min-w-[200px] justify-center shadow-md transform hover:-translate-y-1"
          >
            Já tenho conta
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-6 font-medium">
          ✨ Grátis para sempre. Sem cartão de crédito.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-white/80 backdrop-blur-md py-20 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-navy mb-12">
            Feito para você trabalhar, não para fazer conta
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary-cyan/10 rounded-xl flex items-center justify-center mb-4 text-primary-cyan">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-primary-navy mb-3">
                Registro Fácil
              </h3>
              <p className="text-gray-600">
                Digite &quot;Corte 35&quot; ou fale &quot;Recebi cinquenta reais&quot;. O app entende e registra automaticamente.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary-cyan/10 rounded-xl flex items-center justify-center mb-4 text-primary-cyan">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-primary-navy mb-3">
                Visual Simples
              </h3>
              <p className="text-gray-600">
                Gráficos claros mostram quanto entrou, quanto saiu e onde você está gastando mais.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary-cyan/10 rounded-xl flex items-center justify-center mb-4 text-primary-cyan">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-primary-navy mb-3">
                Alertas Inteligentes
              </h3>
              <p className="text-gray-600">
                Receba avisos quando gastar mais que o normal ou quando o dia está sem entradas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="bg-primary-navy/5 py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-cyan/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-navy/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-6">
            Feito para barbearias, salões e pequenos negócios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Não importa se você corta cabelo, faz unha ou conserta carros.
            O Caixa Fácil se adapta ao seu negócio.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-lg">
            <span className="px-6 py-3 bg-white rounded-full shadow-md text-primary-navy font-medium hover:scale-105 transition-transform cursor-default">💈 Barbearias</span>
            <span className="px-6 py-3 bg-white rounded-full shadow-md text-primary-navy font-medium hover:scale-105 transition-transform cursor-default">💅 Salões de Beleza</span>
            <span className="px-6 py-3 bg-white rounded-full shadow-md text-primary-navy font-medium hover:scale-105 transition-transform cursor-default">🔧 Oficinas</span>
            <span className="px-6 py-3 bg-white rounded-full shadow-md text-primary-navy font-medium hover:scale-105 transition-transform cursor-default">🛒 Comércios</span>
            <span className="px-6 py-3 bg-white rounded-full shadow-md text-primary-navy font-medium hover:scale-105 transition-transform cursor-default">👷 Autônomos</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-navy mb-6">
          Comece agora. É grátis.
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Crie sua conta em menos de 1 minuto e tenha controle total do seu caixa.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-10 py-5 bg-primary-cyan text-white rounded-xl font-semibold text-xl hover:bg-primary-cyan/90 transition-all shadow-lg hover:shadow-xl"
        >
          Criar Conta Grátis
          <ArrowRight className="w-6 h-6" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-primary-navy text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            © 2026 M&A Caixa Fácil. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
