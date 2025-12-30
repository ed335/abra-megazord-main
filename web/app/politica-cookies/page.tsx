'use client';

import Footer from '@/components/shared/Footer';
import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, BarChart, Lock, Info } from 'lucide-react';

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-white">
      
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-verde-oliva hover:text-verde-escuro mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <div className="space-y-8">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-verde-claro/10 rounded-lg">
                <Cookie className="w-6 h-6 text-verde-oliva" />
              </div>
              <h1 className="text-3xl font-semibold text-cinza-escuro">Política de Cookies</h1>
            </div>
            <p className="text-cinza-medio">
              Última atualização: 21 de dezembro de 2024
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Info className="w-5 h-5 text-verde-oliva" />
              1. O que são Cookies?
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, 
              tablet ou smartphone) quando você visita um website. Eles são amplamente utilizados para 
              fazer os sites funcionarem de forma mais eficiente, bem como para fornecer informações 
              aos proprietários do site.
            </p>
            <p className="text-cinza-medio leading-relaxed">
              A ABRACANM - Associação Brasileira de Cannabis Medicinal utiliza cookies e tecnologias 
              similares para melhorar sua experiência em nossa plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">2. Tipos de Cookies que Utilizamos</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-cinza-escuro mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-verde-oliva" />
                  2.1. Cookies Essenciais (Obrigatórios)
                </h3>
                <p className="text-cinza-medio leading-relaxed mb-3">
                  Estes cookies são necessários para o funcionamento básico da plataforma e não podem 
                  ser desativados. Incluem:
                </p>
                <ul className="list-disc list-inside text-cinza-medio space-y-1">
                  <li>Cookies de sessão para manter você conectado</li>
                  <li>Cookies de segurança para prevenir fraudes</li>
                  <li>Cookies de preferências de consentimento</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-cinza-escuro mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-verde-oliva" />
                  2.2. Cookies de Funcionalidade
                </h3>
                <p className="text-cinza-medio leading-relaxed mb-3">
                  Estes cookies permitem que a plataforma lembre suas preferências e ofereça 
                  funcionalidades melhoradas:
                </p>
                <ul className="list-disc list-inside text-cinza-medio space-y-1">
                  <li>Salvar dados de formulário em andamento</li>
                  <li>Lembrar suas preferências de visualização</li>
                  <li>Personalizar o conteúdo com base no seu perfil</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-cinza-escuro mb-3 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-verde-oliva" />
                  2.3. Cookies Analíticos
                </h3>
                <p className="text-cinza-medio leading-relaxed mb-3">
                  Estes cookies nos ajudam a entender como os visitantes interagem com a plataforma, 
                  permitindo melhorias contínuas:
                </p>
                <ul className="list-disc list-inside text-cinza-medio space-y-1">
                  <li>Contagem de visitantes e páginas visualizadas</li>
                  <li>Análise de fluxo de navegação</li>
                  <li>Identificação de páginas com problemas técnicos</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">3. Cookies de Terceiros</h2>
            <p className="text-cinza-medio leading-relaxed">
              Podemos utilizar serviços de terceiros que também colocam cookies em seu dispositivo:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-cinza-escuro">Serviço</th>
                    <th className="text-left py-2 font-semibold text-cinza-escuro">Finalidade</th>
                  </tr>
                </thead>
                <tbody className="text-cinza-medio">
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Vercel Analytics</td>
                    <td className="py-2">Análise de desempenho e uso</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Stripe</td>
                    <td className="py-2">Processamento de pagamentos (quando aplicável)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">4. Tempo de Armazenamento</h2>
            <p className="text-cinza-medio leading-relaxed">
              Os cookies têm diferentes períodos de validade:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Cookies de sessão:</strong> São temporários e expiram quando você fecha o navegador</li>
                <li><strong>Cookies persistentes:</strong> Permanecem no seu dispositivo por um período definido ou até você excluí-los</li>
                <li><strong>Cookies de autenticação:</strong> Válidos por até 7 dias (podem variar conforme configurações de segurança)</li>
                <li><strong>Cookies de preferências:</strong> Válidos por até 1 ano</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">5. Como Gerenciar Cookies</h2>
            <p className="text-cinza-medio leading-relaxed">
              Você pode controlar e gerenciar cookies de várias formas:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-medium text-cinza-escuro mb-2">5.1. Configurações do Navegador</h3>
                <p className="text-cinza-medio leading-relaxed">
                  A maioria dos navegadores permite que você veja, gerencie, exclua e bloqueie cookies. 
                  Veja como acessar as configurações nos principais navegadores:
                </p>
                <ul className="list-disc list-inside text-cinza-medio mt-2 space-y-1">
                  <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
                  <li><strong>Firefox:</strong> Configurações → Privacidade e Segurança → Cookies</li>
                  <li><strong>Safari:</strong> Preferências → Privacidade → Gerenciar dados do site</li>
                  <li><strong>Edge:</strong> Configurações → Cookies e permissões de site</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-cinza-escuro mb-2">5.2. Impacto da Desativação</h3>
                <p className="text-cinza-medio leading-relaxed">
                  Note que desativar cookies pode afetar a funcionalidade da plataforma. Você pode 
                  não conseguir:
                </p>
                <ul className="list-disc list-inside text-cinza-medio mt-2 space-y-1">
                  <li>Manter-se conectado à sua conta</li>
                  <li>Salvar progresso em formulários</li>
                  <li>Acessar funcionalidades personalizadas</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">6. Tecnologias Similares</h2>
            <p className="text-cinza-medio leading-relaxed">
              Além de cookies, podemos utilizar outras tecnologias similares:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Local Storage:</strong> Armazenamento de dados no navegador para melhor desempenho</li>
                <li><strong>Session Storage:</strong> Armazenamento temporário de dados durante a sessão</li>
                <li><strong>Tokens JWT:</strong> Para autenticação segura de usuários</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">7. Atualizações desta Política</h2>
            <p className="text-cinza-medio leading-relaxed">
              Esta Política de Cookies pode ser atualizada periodicamente para refletir mudanças em 
              nossas práticas ou por outras razões operacionais, legais ou regulatórias. Recomendamos 
              que você revise esta página regularmente para se manter informado sobre como utilizamos cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">8. Mais Informações</h2>
            <p className="text-cinza-medio leading-relaxed">
              Para mais informações sobre como tratamos seus dados pessoais, consulte nossa{' '}
              <Link href="/politica-privacidade" className="text-verde-oliva hover:underline">
                Política de Privacidade
              </Link>.
            </p>
            <div className="bg-verde-claro/10 border border-verde-claro/30 rounded-lg p-6">
              <p className="text-cinza-medio leading-relaxed mb-4">
                Dúvidas sobre esta Política de Cookies? Entre em contato:
              </p>
              <div className="space-y-2 text-cinza-medio">
                <p><strong>E-mail:</strong> ouvidoria@abracanm.org.br</p>
                <p><strong>Telefone:</strong> (61) 9608-4949</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-8">
            <p className="text-cinza-medio text-sm">
              © 2025 ABRACANM - Associação Brasileira de Cannabis Medicinal. Todos os direitos reservados.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
