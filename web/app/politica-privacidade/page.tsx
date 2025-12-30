'use client';

import Footer from '@/components/shared/Footer';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Users, Database, Clock, Mail } from 'lucide-react';

export default function PoliticaPrivacidade() {
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
                <Shield className="w-6 h-6 text-verde-oliva" />
              </div>
              <h1 className="text-3xl font-semibold text-cinza-escuro">Política de Privacidade</h1>
            </div>
            <p className="text-cinza-medio">
              Última atualização: 21 de dezembro de 2024
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Eye className="w-5 h-5 text-verde-oliva" />
              1. Introdução
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              A ABRACANM - Associação Brasileira de Cannabis Medicinal (CNPJ: 59.859.467/0001-34), 
              com sede na Quadra QS 1 Rua 212, Edif Connect Towers, Brasília – DF, está comprometida 
              com a proteção da privacidade e dos dados pessoais de seus associados, visitantes e 
              usuários de seus serviços.
            </p>
            <p className="text-cinza-medio leading-relaxed">
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos, 
              compartilhamos e protegemos suas informações pessoais, em conformidade com a 
              Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e demais legislações aplicáveis.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Database className="w-5 h-5 text-verde-oliva" />
              2. Dados Pessoais que Coletamos
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              Coletamos os seguintes tipos de dados pessoais:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-medium text-cinza-escuro mb-2">2.1. Dados de Identificação</h3>
                <ul className="list-disc list-inside text-cinza-medio space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Número de telefone/WhatsApp</li>
                  <li>Documento de identidade (RG ou CNH)</li>
                  <li>Endereço residencial completo (CEP, rua, número, complemento, bairro, cidade, estado)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-cinza-escuro mb-2">2.2. Dados de Saúde (Dados Sensíveis)</h3>
                <ul className="list-disc list-inside text-cinza-medio space-y-1">
                  <li>Patologia ou condição médica (com código CID)</li>
                  <li>Histórico de uso de cannabis medicinal</li>
                  <li>Documentos médicos (laudos, prescrições, relatórios)</li>
                  <li>Informações da pré-anamnese (sintomas, tratamentos prévios, comorbidades)</li>
                  <li>Preferências de acompanhamento médico</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-cinza-escuro mb-2">2.3. Dados de Acesso</h3>
                <ul className="list-disc list-inside text-cinza-medio space-y-1">
                  <li>Credenciais de acesso (e-mail e senha criptografada)</li>
                  <li>Registros de acesso à plataforma</li>
                  <li>Endereço IP e informações do dispositivo</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Lock className="w-5 h-5 text-verde-oliva" />
              3. Finalidades do Tratamento
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">a)</span>
                  Cadastro e gestão de associados
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">b)</span>
                  Verificação de elegibilidade para tratamento com cannabis medicinal
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">c)</span>
                  Agendamento e realização de consultas médicas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">d)</span>
                  Acompanhamento do tratamento e evolução clínica
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">e)</span>
                  Comunicação sobre serviços, novidades e informações relevantes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">f)</span>
                  Cumprimento de obrigações legais e regulatórias
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">g)</span>
                  Elaboração de relatórios estatísticos (dados anonimizados)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-verde-oliva font-medium">h)</span>
                  Defesa em processos judiciais, administrativos ou arbitrais
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">4. Base Legal para Tratamento</h2>
            <p className="text-cinza-medio leading-relaxed">
              O tratamento de seus dados pessoais é realizado com base nas seguintes hipóteses legais 
              previstas na LGPD:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Consentimento (Art. 7º, I):</strong> Para dados sensíveis de saúde e comunicações de marketing</li>
                <li><strong>Execução de contrato (Art. 7º, V):</strong> Para prestação dos serviços de associação</li>
                <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> Para atendimento de exigências regulatórias</li>
                <li><strong>Proteção da vida (Art. 7º, VII):</strong> Em situações de emergência médica</li>
                <li><strong>Tutela da saúde (Art. 7º, VIII):</strong> Para procedimentos realizados por profissionais de saúde</li>
                <li><strong>Exercício regular de direitos (Art. 7º, VI):</strong> Para defesa em processos</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Users className="w-5 h-5 text-verde-oliva" />
              5. Compartilhamento de Dados
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              Seus dados pessoais podem ser compartilhados com:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Médicos prescritores:</strong> Para realização de consultas e acompanhamento do tratamento</li>
                <li><strong>Laboratórios e fornecedores:</strong> Para dispensação de produtos medicinais</li>
                <li><strong>Órgãos reguladores:</strong> Quando exigido por lei (ANVISA, Secretarias de Saúde)</li>
                <li><strong>Prestadores de serviços:</strong> Empresas de tecnologia, armazenamento em nuvem e processamento de pagamentos</li>
                <li><strong>Autoridades judiciais:</strong> Em cumprimento de ordem judicial</li>
              </ul>
            </div>
            <p className="text-cinza-medio leading-relaxed">
              Não comercializamos, vendemos ou alugamos seus dados pessoais a terceiros para fins 
              de marketing ou qualquer outra finalidade não relacionada aos serviços da ABRACANM.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Clock className="w-5 h-5 text-verde-oliva" />
              6. Retenção dos Dados
            </h2>
            <p className="text-cinza-medio leading-relaxed">
              Seus dados pessoais serão mantidos pelo período necessário para cumprir as finalidades 
              para as quais foram coletados, observando os seguintes critérios:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Dados de cadastro:</strong> Durante a vigência da associação e por 5 anos após o encerramento</li>
                <li><strong>Prontuários médicos:</strong> 20 anos, conforme legislação de saúde (CFM)</li>
                <li><strong>Documentos fiscais:</strong> 5 anos, conforme legislação tributária</li>
                <li><strong>Registros de consentimento:</strong> Enquanto o consentimento for válido e por 5 anos após revogação</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">7. Segurança dos Dados</h2>
            <p className="text-cinza-medio leading-relaxed">
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li>Criptografia de dados em trânsito (SSL/TLS) e em repouso</li>
                <li>Controle de acesso baseado em funções (RBAC)</li>
                <li>Autenticação segura com tokens JWT</li>
                <li>Monitoramento e registro de atividades (logs de auditoria)</li>
                <li>Backups regulares e redundância de dados</li>
                <li>Treinamento de funcionários sobre proteção de dados</li>
                <li>Avaliações periódicas de segurança</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">8. Seus Direitos</h2>
            <p className="text-cinza-medio leading-relaxed">
              Conforme a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-cinza-medio">
                <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessar suas informações</li>
                <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Anonimização, bloqueio ou eliminação:</strong> Solicitar a anonimização ou exclusão de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados a outro fornecedor</li>
                <li><strong>Eliminação:</strong> Solicitar a eliminação dos dados tratados com base em consentimento</li>
                <li><strong>Informação sobre compartilhamento:</strong> Saber com quem seus dados são compartilhados</li>
                <li><strong>Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Opor-se ao tratamento quando realizado de forma irregular</li>
              </ul>
            </div>
            <p className="text-cinza-medio leading-relaxed">
              Para exercer qualquer desses direitos, entre em contato conosco através do e-mail{' '}
              <a href="mailto:ouvidoria@abracanm.org.br" className="text-verde-oliva hover:underline">
                ouvidoria@abracanm.org.br
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">9. Cookies e Tecnologias Similares</h2>
            <p className="text-cinza-medio leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência em nossa plataforma. 
              Para mais informações, consulte nossa{' '}
              <Link href="/politica-cookies" className="text-verde-oliva hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro">10. Alterações desta Política</h2>
            <p className="text-cinza-medio leading-relaxed">
              Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos você sobre 
              alterações significativas através do e-mail cadastrado ou por aviso em nossa plataforma. 
              A data da última atualização estará sempre indicada no topo deste documento.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cinza-escuro flex items-center gap-2">
              <Mail className="w-5 h-5 text-verde-oliva" />
              11. Contato e Encarregado de Dados (DPO)
            </h2>
            <div className="bg-verde-claro/10 border border-verde-claro/30 rounded-lg p-6">
              <p className="text-cinza-medio leading-relaxed mb-4">
                Para dúvidas, solicitações ou reclamações sobre o tratamento de seus dados pessoais, 
                entre em contato com nosso Encarregado de Proteção de Dados:
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
              Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção 
              de Dados (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e demais 
              legislações aplicáveis.
            </p>
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
