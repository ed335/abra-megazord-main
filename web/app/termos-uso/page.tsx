'use client';

import Footer from '@/components/shared/Footer';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Ban, RefreshCw } from 'lucide-react';

export default function TermosUso() {
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
                <FileText className="w-6 h-6 text-verde-oliva" />
              </div>
              <h1 className="text-3xl font-semibold text-cinza-escuro">Termos de Uso</h1>
            </div>
            <p className="text-cinza-medio">
              Última atualização: 21 de dezembro de 2024
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">1. Aceitação dos Termos</h2>
            <p className="text-cinza-medio leading-relaxed">
              Ao acessar e utilizar a plataforma da ABRACANM - Associação Brasileira de Cannabis Medicinal 
              (CNPJ: 59.859.467/0001-34), você declara ter lido, compreendido e aceito integralmente estes 
              Termos de Uso, bem como nossa{' '}
              <Link href="/politica-privacidade" className="text-verde-oliva hover:underline">
                Política de Privacidade
              </Link>.
            </p>
            <p className="text-cinza-medio leading-relaxed">
              Caso não concorde com qualquer disposição destes Termos, solicitamos que não utilize 
              nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">2. Definições</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>ABRACANM:</strong> Associação Brasileira de Cannabis Medicinal, mantenedora desta plataforma</li>
                <li><strong>Plataforma:</strong> Website, aplicativo e sistemas digitais da ABRACANM</li>
                <li><strong>Usuário:</strong> Qualquer pessoa que acesse a plataforma</li>
                <li><strong>Associado:</strong> Usuário cadastrado como membro da associação</li>
                <li><strong>Serviços:</strong> Funcionalidades oferecidas através da plataforma</li>
                <li><strong>Prescritor:</strong> Profissional de saúde habilitado para prescrever cannabis medicinal</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-verde-oliva" />
              3. Serviços Oferecidos
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              A ABRACANM oferece os seguintes serviços através de sua plataforma:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">a)</span>
                  Cadastro de associados interessados em tratamento com cannabis medicinal
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">b)</span>
                  Pré-anamnese para avaliação inicial do perfil do paciente
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">c)</span>
                  Conexão com médicos prescritores qualificados
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">d)</span>
                  Agendamento de consultas médicas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">e)</span>
                  Acompanhamento do tratamento
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">f)</span>
                  Orientações sobre documentação necessária
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">g)</span>
                  Suporte e atendimento ao associado
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">4. Elegibilidade</h2>
            <p className="text-cinza-medio leading-relaxed">
              Para se associar à ABRACANM, você deve:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li>Ter 18 anos ou mais, ou ser representado por responsável legal</li>
                <li>Possuir diagnóstico médico de condição tratável com cannabis medicinal</li>
                <li>Fornecer informações verdadeiras e atualizadas no cadastro</li>
                <li>Apresentar documentação válida (identidade e laudos médicos)</li>
                <li>Aceitar os termos e condições da associação</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">5. Obrigações do Usuário</h2>
            <p className="text-cinza-medio leading-relaxed">
              Ao utilizar nossa plataforma, você se compromete a:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Não compartilhar sua conta com terceiros</li>
                <li>Utilizar a plataforma apenas para fins lícitos e conforme sua finalidade</li>
                <li>Não tentar burlar medidas de segurança da plataforma</li>
                <li>Não enviar conteúdo ofensivo, ilegal ou que viole direitos de terceiros</li>
                <li>Comunicar imediatamente qualquer uso não autorizado de sua conta</li>
                <li>Seguir as orientações médicas recebidas durante o tratamento</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              6. Condutas Proibidas
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              É expressamente proibido:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li>Fornecer informações falsas ou documentos fraudulentos</li>
                <li>Utilizar o serviço para fins recreativos ou não medicinais</li>
                <li>Comercializar ou revender produtos obtidos através da associação</li>
                <li>Compartilhar prescrições ou medicamentos com terceiros</li>
                <li>Tentar acessar áreas restritas da plataforma sem autorização</li>
                <li>Realizar engenharia reversa ou tentar comprometer a segurança do sistema</li>
                <li>Utilizar bots, scripts ou automações não autorizadas</li>
                <li>Difamar, assediar ou ameaçar outros usuários ou funcionários</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              7. Limitação de Responsabilidade
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              A ABRACANM:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Não é um serviço médico:</strong> Somos uma associação que conecta pacientes a prescritores qualificados. A relação médico-paciente é estabelecida diretamente entre o associado e o profissional de saúde.</li>
                <li><strong>Não garante resultados:</strong> Os resultados do tratamento variam de pessoa para pessoa e dependem de diversos fatores individuais.</li>
                <li><strong>Não fornece diagnósticos:</strong> A avaliação diagnóstica é de responsabilidade exclusiva dos profissionais de saúde.</li>
                <li><strong>Não se responsabiliza por interrupções:</strong> Podemos ter períodos de manutenção ou indisponibilidade técnica.</li>
                <li><strong>Não se responsabiliza por uso indevido:</strong> O uso dos produtos e serviços de forma diversa da prescrita é de responsabilidade do associado.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">8. Propriedade Intelectual</h2>
            <p className="text-cinza-medio leading-relaxed">
              Todo o conteúdo da plataforma, incluindo mas não limitado a textos, imagens, logotipos, 
              marcas, design, código-fonte e demais elementos, é de propriedade exclusiva da ABRACANM 
              ou de seus licenciadores, protegido pela legislação de propriedade intelectual.
            </p>
            <p className="text-cinza-medio leading-relaxed">
              É proibida a reprodução, distribuição, modificação ou utilização comercial de qualquer 
              conteúdo sem autorização prévia por escrito da ABRACANM.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">9. Pagamentos e Reembolsos</h2>
            <p className="text-cinza-medio leading-relaxed">
              Os serviços da ABRACANM podem envolver custos de associação, consultas e produtos. 
              As condições de pagamento e reembolso são:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li>Os valores serão informados antes da contratação de cada serviço</li>
                <li>Consultas canceladas com menos de 24h de antecedência não serão reembolsadas</li>
                <li>Produtos dispensados não são passíveis de devolução por questões sanitárias</li>
                <li>Eventuais reembolsos serão processados na mesma forma de pagamento original</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-verde-oliva" />
              10. Suspensão e Cancelamento
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              A ABRACANM reserva-se o direito de suspender ou cancelar o acesso de qualquer usuário 
              que viole estes Termos de Uso, sem prejuízo de outras medidas cabíveis.
            </p>
            <p className="text-cinza-medio leading-relaxed">
              O associado pode solicitar o cancelamento de sua associação a qualquer momento, 
              entrando em contato através dos canais oficiais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">11. Modificações dos Termos</h2>
            <p className="text-cinza-medio leading-relaxed">
              Estes Termos de Uso podem ser atualizados periodicamente. As alterações entrarão em vigor 
              após publicação na plataforma. O uso continuado dos serviços após as alterações constitui 
              aceitação dos novos termos.
            </p>
            <p className="text-cinza-medio leading-relaxed">
              Alterações significativas serão comunicadas através do e-mail cadastrado ou aviso 
              destacado na plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Scale className="w-5 h-5 text-verde-oliva" />
              12. Legislação e Foro
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              Estes Termos de Uso são regidos pela legislação brasileira. Fica eleito o foro da 
              Circunscrição Judiciária de Brasília - DF para dirimir quaisquer controvérsias 
              decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado 
              que seja.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">13. Disposições Gerais</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li>A tolerância de qualquer parte em exigir o cumprimento de cláusula não constitui renúncia ao direito de exigi-lo posteriormente.</li>
                <li>Se qualquer disposição for considerada inválida, as demais permanecerão em pleno vigor.</li>
                <li>Estes Termos constituem o acordo integral entre as partes sobre o uso da plataforma.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">14. Contato</h2>
            <div className="bg-verde-claro/10 border border-verde-claro/30 rounded-lg p-6">
              <p className="text-cinza-medio leading-relaxed mb-4">
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <div className="space-y-2 text-cinza-medio">
                <p><strong>E-mail:</strong> ouvidoria@abracanm.org.br</p>
                <p><strong>Telefone:</strong> (61) 9608-4949</p>
                <p><strong>Endereço:</strong> Quadra QS 1 Rua 212, Edif Connect Towers, Brasília – DF</p>
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
