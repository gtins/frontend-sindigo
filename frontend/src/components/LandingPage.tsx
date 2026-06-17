import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  Hotel,
  CheckSquare,
  Calendar,
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  Lock,
  History,
  MessageSquare,
  Globe,
  UserCheck,
  BarChart3,
} from 'lucide-react';
import AuthService from '../services/authService';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predios' | 'calendario' | 'financas' | 'chamados'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('sindigo-theme') === 'dark';
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (AuthService.hasToken()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sindigo-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sindigo-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* 1. Header Fixo */}
      <header className="landing-header">
        <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="landing-logo-icon">
            <Building2 size={22} color="var(--color-accent)" strokeWidth={2.5} />
          </div>
          <h1 className="landing-logo-text">SindiGo</h1>
        </div>

        <nav className="landing-nav">
          <a href="#inicio" className="landing-nav-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Início</a>
          <a href="#funcionalidades" className="landing-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('funcionalidades'); }}>Funcionalidades</a>
          <a href="#beneficios" className="landing-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('beneficios'); }}>Benefícios</a>
          <a href="#seguranca" className="landing-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('seguranca'); }}>Segurança</a>
          <a href="#contato" className="landing-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('contato'); }}>Contato</a>
        </nav>

        <div className="landing-actions">
          <button
            onClick={toggleDarkMode}
            className="landing-btn-theme"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
          </button>

          <button className="landing-btn landing-btn-sec" onClick={() => navigate('/login')}>
            Entrar
          </button>
          <button className="landing-btn landing-btn-pri" onClick={() => navigate('/register')}>
            Começar agora
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="inicio" className="landing-section" style={{ marginTop: '72px' }}>
        <div className="hero-wrapper">
          <div className="hero-content">
            <h2 className="hero-title">
              Gestão condominial <span>simples</span>, organizada e <span>rastreável</span>.
            </h2>
            <p className="hero-subtitle">
              Centralize chamados, reservas, atividades, moradores, prestadores e finanças em uma única plataforma integrada e transparente.
            </p>
            <div className="hero-actions">
              <button className="landing-btn landing-btn-pri" onClick={() => navigate('/register')}>
                Começar agora <ArrowRight size={16} />
              </button>
              <button className="landing-btn landing-btn-sec" onClick={() => scrollToSection('funcionalidades')}>
                Ver funcionalidades
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-bg-glow"></div>

            {/* Mockup do Dashboard */}
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-skeleton-title"></div>
                <div className="mockup-grid">
                  <div className="mockup-left">
                    <div className="mockup-bar w-100"></div>
                    <div className="mockup-bar w-80"></div>
                    <div className="mockup-bar w-60"></div>
                    <div className="mockup-bar w-100" style={{ height: '30px', marginTop: '10px', backgroundColor: 'var(--color-accent-light)', borderRadius: '6px' }}></div>
                  </div>
                  <div className="mockup-right">
                    <div className="mockup-stat">
                      <div className="mockup-bar w-60"></div>
                      <div className="mockup-bar w-80" style={{ height: '14px', backgroundColor: 'var(--color-accent)' }}></div>
                    </div>
                    <div className="mockup-stat">
                      <div className="mockup-bar w-80"></div>
                      <div className="mockup-bar w-60" style={{ height: '14px', backgroundColor: 'var(--status-orange)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Flutuantes */}
            <div className="floating-card floating-card-1">
              <div className="floating-icon-wrapper">
                <CheckSquare size={16} />
              </div>
              <div className="floating-card-info">
                <span className="floating-card-label">Chamados Abertos</span>
                <span className="floating-card-value">12 urgentes</span>
              </div>
            </div>

            <div className="floating-card floating-card-2">
              <div className="floating-icon-wrapper">
                <Calendar size={16} />
              </div>
              <div className="floating-card-info">
                <span className="floating-card-label">Reservas Pendentes</span>
                <span className="floating-card-value">Salão de Festas</span>
              </div>
            </div>

            <div className="floating-card floating-card-3">
              <div className="floating-icon-wrapper">
                <Activity size={16} />
              </div>
              <div className="floating-card-info">
                <span className="floating-card-label">Atividades de Hoje</span>
                <span className="floating-card-value">Manutenção Elevador</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Seção "Problemas que o SindiGo resolve" */}
      <section className="landing-section" style={{ backgroundColor: 'var(--bg-hover)', borderRadius: '24px', margin: '40px auto' }}>
        <div className="section-header">
          <span className="section-tag">Desafios Comuns</span>
          <h3 className="section-title">O que o SindiGo resolve na sua rotina?</h3>
          <p className="section-subtitle">
            Chega de se perder no caos da gestão informal. Nós centralizamos o que importa.
          </p>
        </div>

        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon-box">
              <MessageSquare size={22} />
            </div>
            <h4 className="problem-card-title">Caos no WhatsApp</h4>
            <p className="problem-card-desc">Informações importantes perdidas em conversas informais ou grupos barulhentos que ninguém acompanha.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-box">
              <History size={22} />
            </div>
            <h4 className="problem-card-title">Falta de Histórico</h4>
            <p className="problem-card-desc">Dificuldade para lembrar quem fez o quê, quando uma manutenção foi realizada ou quem aprovou uma ação.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-box">
              <Calendar size={22} />
            </div>
            <h4 className="problem-card-title">Conflito de Reservas</h4>
            <p className="problem-card-desc">Moradores reservando a mesma área no mesmo horário por falta de um calendário digital único e auditável.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-box">
              <AlertCircle size={22} />
            </div>
            <h4 className="problem-card-title">Chamados Esquecidos</h4>
            <p className="problem-card-desc">Pedidos de moradores que somem em papéis ou anotações sem prazos, prioridades ou evidências de fechamento.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-box">
              <Lock size={22} />
            </div>
            <h4 className="problem-card-title">Anexos e Comprovantes Perdidos</h4>
            <p className="problem-card-desc">Comprovantes de pagamento e fotos de vistorias espalhados em emails e pastas físicas inacessíveis.</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon-box">
              <Users size={22} />
            </div>
            <h4 className="problem-card-title">Falta de Transparência</h4>
            <p className="problem-card-desc">Moradores desconfiados que reclamam por não saber o que está sendo planejado ou executado no condomínio.</p>
          </div>
        </div>
      </section>

      {/* 4. Seção de Funcionalidades Principais */}
      <section id="funcionalidades" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Nossos Módulos</span>
          <h3 className="section-title">Tudo o que você precisa em uma única plataforma</h3>
          <p className="section-subtitle">
            Recursos projetados especificamente para organizar a vida de administradores, síndicos e moradores.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <LayoutDashboard size={20} />
            </div>
            <h4 className="feature-card-title">Dashboard Global</h4>
            <p className="feature-card-desc">Visão panorâmica instantânea sobre prédios, chamados urgentes, reservas do dia e status de atividades críticas.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Hotel size={20} />
            </div>
            <h4 className="feature-card-title">Gestão de Prédios</h4>
            <p className="feature-card-desc">Cadastre múltiplos condomínios, configure blocos e unidades e mapeie endereços de maneira intuitiva.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <CheckSquare size={20} />
            </div>
            <h4 className="feature-card-title">Chamados e Ocorrências</h4>
            <p className="feature-card-desc">Abertura com upload de imagens (evidências), acompanhamento de status, designação de responsáveis e encerramento seguro.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Calendar size={20} />
            </div>
            <h4 className="feature-card-title">Reservas Simplificadas</h4>
            <p className="feature-card-desc">Agende áreas comuns (salão, piscina, quadras) com validação automática de datas e fluxo de aprovação transparente.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Activity size={20} />
            </div>
            <h4 className="feature-card-title">Controle de Atividades</h4>
            <p className="feature-card-desc">Registro de manutenções rotineiras, limpezas periódicas e checklists obrigatórios para evitar multas e sinistros.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Users size={20} />
            </div>
            <h4 className="feature-card-title">Moradores & Permissões</h4>
            <p className="feature-card-desc">Vincule moradores às unidades, controle quem acessa cada função e gerencie convites de acesso com segurança.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <UserCheck size={20} />
            </div>
            <h4 className="feature-card-title">Prestadores de Serviço</h4>
            <p className="feature-card-desc">Cadastro de contatos profissionais e categorização de prestadores associados a chamados específicos e vistorias.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <TrendingUp size={20} />
            </div>
            <h4 className="feature-card-title">Finanças Práticas</h4>
            <p className="feature-card-desc">Acompanhe entradas e saídas de caixa do condomínio, veja saldos consolidados e exporte relatórios para planilhas CSV.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <History size={20} />
            </div>
            <h4 className="feature-card-title">Auditoria Integrada</h4>
            <p className="feature-card-desc">Rastreamento completo e permanente de cada ação realizada na plataforma (quem atualizou dados, logs de login, etc.).</p>
          </div>
        </div>
      </section>

      {/* 5. Seção "Como Funciona" */}
      <section className="landing-section" style={{ backgroundColor: 'var(--bg-hover)', borderRadius: '24px', margin: '40px auto' }}>
        <div className="section-header">
          <span className="section-tag">Passo a Passo</span>
          <h3 className="section-title">Como começar a usar em minutos</h3>
          <p className="section-subtitle">
            Nossa plataforma foi pensada para ser implantada sem atrito nem treinamentos complexos.
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>

          <div className="timeline-step">
            <div className="timeline-number">1</div>
            <h4 className="timeline-title">Cadastre o Condomínio</h4>
            <p className="timeline-desc">Insira as informações básicas do seu prédio e configure as áreas de lazer do condomínio.</p>
          </div>

          <div className="timeline-step">
            <div className="timeline-number">2</div>
            <h4 className="timeline-title">Adicione Moradores</h4>
            <p className="timeline-desc">Importe e gerencie moradores, vinculando cada um às respectivas unidades condominiais.</p>
          </div>

          <div className="timeline-step">
            <div className="timeline-number">3</div>
            <h4 className="timeline-title">Gerencie o Dia a Dia</h4>
            <p className="timeline-desc">Abra chamados com fotos, acompanhe manutenções e receba solicitações de reservas.</p>
          </div>

          <div className="timeline-step">
            <div className="timeline-number">4</div>
            <h4 className="timeline-title">Acompanhe Tudo</h4>
            <p className="timeline-desc">Analise gráficos financeiros, gere relatórios e garanta auditoria completa no painel global.</p>
          </div>
        </div>
      </section>

      {/* 6. Seção de Benefícios */}
      <section id="beneficios" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Resultados Reais</span>
          <h3 className="section-title">Benefícios de migrar para o SindiGo</h3>
          <p className="section-subtitle">
            O impacto imediato na organização do condomínio percebido por todos os envolvidos.
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Mais Organização para o Síndico</h4>
            <p className="benefit-desc">Tenha uma agenda clara de manutenções e chamados, eliminando pendências acumuladas.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Total Transparência</h4>
            <p className="benefit-desc">Moradores acompanham comunicados oficiais e andamento de reservas abertamente.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Silêncio no WhatsApp</h4>
            <p className="benefit-desc">Reduza em até 80% o fluxo de mensagens e cobranças informais no celular pessoal.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Histórico Rastreável</h4>
            <p className="benefit-desc">Toda alteração é auditada, servindo de comprovação e defesa para a administração.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Central de Documentos</h4>
            <p className="benefit-desc">Anexe notas fiscais, fotos de obras e comprovantes vinculados a cada transação.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Reservas Sem Fila</h4>
            <p className="benefit-desc">Acabe com discussões sobre quem reservou primeiro o salão de festas no fim de ano.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Finanças Visíveis</h4>
            <p className="benefit-desc">Acompanhamento básico do fluxo de caixa e exportação rápida para o conselho fiscal.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="benefit-title">Gestão Multicondomínio</h4>
            <p className="benefit-desc">Gerencie mais de um condomínio a partir de um único login administrativo.</p>
          </div>
        </div>
      </section>

      {/* 7. Seção por Perfil de Usuário */}
      <section className="landing-section" style={{ backgroundColor: 'var(--bg-hover)', borderRadius: '24px', margin: '40px auto' }}>
        <div className="section-header">
          <span className="section-tag">Acessibilidade e Regras</span>
          <h3 className="section-title">Um painel sob medida para cada necessidade</h3>
          <p className="section-subtitle">
            Nossos níveis de acesso garantem que cada usuário acesse apenas o que é do seu escopo de atuação.
          </p>
        </div>

        <div className="profiles-grid">
          <div className="profile-card admin">
            <h4 className="profile-role-title">Administrador</h4>
            <p className="profile-role-desc">Administradora Condominial ou Síndico Geral</p>
            <ul className="profile-bullet-list">
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Cadastra prédios, blocos e unidades no sistema
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Gerencia contas, acessos e altera permissões
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Consulta trilha de auditoria completa de ações
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Acompanha métricas globais e relatórios consolidados
              </li>
            </ul>
          </div>

          <div className="profile-card sindico">
            <h4 className="profile-role-title">Síndico / Subsíndico</h4>
            <p className="profile-role-desc">Gestor Operacional do Condomínio</p>
            <ul className="profile-bullet-list">
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Aprova ou recusa reservas de áreas comuns
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Acompanha atividades de zeladoria e fornecedores
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Atribui responsáveis e encerra chamados abertos
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Lança receitas e despesas e consulta saldo mensal
              </li>
            </ul>
          </div>

          <div className="profile-card morador">
            <h4 className="profile-role-title">Morador</h4>
            <p className="profile-role-desc">Inquilino ou Proprietário residente</p>
            <ul className="profile-bullet-list">
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Abre chamados com fotos direto pelo smartphone
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Solicita agendamento de áreas comuns no calendário
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Visualiza comunicados e atividades de manutenção
              </li>
              <li className="profile-bullet-item">
                <span className="profile-bullet-bullet"><CheckCircle2 size={16} /></span>
                Interface simplificada e sem jargões complexos
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Seção de Segurança e Confiabilidade */}
      <section id="seguranca" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Conformidade e Proteção</span>
          <h3 className="section-title">Seus dados protegidos por arquitetura robusta</h3>
          <p className="section-subtitle">
            Segurança de nível corporativo implementada em todas as camadas de comunicação e persistência.
          </p>
        </div>

        <div className="security-grid">
          <div className="security-card">
            <div className="security-icon-wrapper">
              <Lock size={20} />
            </div>
            <div className="security-info">
              <h4 className="security-title">Tokens Seguros JWT</h4>
              <p className="security-desc">Autenticação baseada em JSON Web Tokens com expiração segura.</p>
            </div>
          </div>

          <div className="security-card">
            <div className="security-icon-wrapper">
              <UserCheck size={20} />
            </div>
            <div className="security-info">
              <h4 className="security-title">Níveis de Acesso (RBAC)</h4>
              <p className="security-desc">Controle rígido sobre permissões de rotas e operações confidenciais.</p>
            </div>
          </div>

          <div className="security-card">
            <div className="security-icon-wrapper">
              <History size={20} />
            </div>
            <div className="security-info">
              <h4 className="security-title">Logs de Auditoria</h4>
              <p className="security-desc">Histórico completo de alterações imutável no banco de dados.</p>
            </div>
          </div>

          <div className="security-card">
            <div className="security-icon-wrapper">
              <ShieldCheck size={20} />
            </div>
            <div className="security-info">
              <h4 className="security-title">Anexos Criptografados</h4>
              <p className="security-desc">Validação e armazenamento isolado de imagens de chamados e comprovantes.</p>
            </div>
          </div>

          <div className="security-card">
            <div className="security-icon-wrapper">
              <Globe size={20} />
            </div>
            <div className="security-info">
              <h4 className="security-title">Comunicação HTTPS</h4>
              <p className="security-desc">Criptografia em trânsito com protocolo SSL para todas as requisições API.</p>
            </div>
          </div>

          <div className="security-card">
            <div className="security-icon-wrapper">
              <Lock size={20} />
            </div>
            <div className="security-info">
              <h4 className="security-title">Prevenção contra Vulnerabilidades</h4>
              <p className="security-desc">Prevenção nativa contra XSS e injeção de parâmetros nos formulários.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Seção com Preview da Interface (Interativo) */}
      <section className="landing-section" style={{ backgroundColor: 'var(--bg-hover)', borderRadius: '24px', margin: '40px auto' }}>
        <div className="section-header">
          <span className="section-tag">Demonstração Interativa</span>
          <h3 className="section-title">Explore as telas do SindiGo</h3>
          <p className="section-subtitle">
            Veja como é simples navegar no sistema. Clique nas abas abaixo para simular as principais interfaces operacionais.
          </p>
        </div>

        {/* Abas */}
        <div className="preview-tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`preview-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('predios')}
            className={`preview-tab-btn ${activeTab === 'predios' ? 'active' : ''}`}
          >
            Detalhes do Prédio
          </button>
          <button
            onClick={() => setActiveTab('calendario')}
            className={`preview-tab-btn ${activeTab === 'calendario' ? 'active' : ''}`}
          >
            Calendário de Reservas
          </button>
          <button
            onClick={() => setActiveTab('financas')}
            className={`preview-tab-btn ${activeTab === 'financas' ? 'active' : ''}`}
          >
            Finanças do Caixa
          </button>
          <button
            onClick={() => setActiveTab('chamados')}
            className={`preview-tab-btn ${activeTab === 'chamados' ? 'active' : ''}`}
          >
            Gestão de Chamados
          </button>
        </div>

        {/* Display do Mockup */}
        <div className="preview-display">
          <div className="preview-bar">
            <div style={{ display: 'flex', gap: '6px' }}>
              <div className="mockup-dot"></div>
              <div className="mockup-dot"></div>
              <div className="mockup-dot"></div>
            </div>
            <div className="preview-url">
              https://app.sindigo.com.br/{activeTab === 'dashboard' ? '' : activeTab}
            </div>
            <div style={{ width: '30px' }}></div>
          </div>

          <div className="preview-window-body">
            {activeTab === 'dashboard' && (
              <>
                <div className="preview-dash-grid">
                  <div className="preview-dash-card">
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Chamados Abertos</span>
                    <span className="preview-dash-card-num">✓ 7</span>
                    <span style={{ fontSize: '10px', color: 'var(--status-green)', fontWeight: 500 }}>+2 resolvidos hoje</span>
                  </div>
                  <div className="preview-dash-card">
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Reservas Pendentes</span>
                    <span className="preview-dash-card-num">3</span>
                    <span style={{ fontSize: '10px', color: 'var(--status-orange)', fontWeight: 500 }}>Aguardando síndico</span>
                  </div>
                  <div className="preview-dash-card">
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Atividades Pendentes</span>
                    <span className="preview-dash-card-num">5</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 500 }}>Rotinas operacionais</span>
                  </div>
                  <div className="preview-dash-card">
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Prédios Ativos</span>
                    <span className="preview-dash-card-num">2</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 500 }}>186 unidades cadastradas</span>
                  </div>
                </div>

                <div className="preview-dash-content-split">
                  <div className="preview-main-panel">
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Últimas Ocorrências</span>
                    <div className="preview-list-item">
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>Vazamento de água na garagem</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Bloco B - Unidade 202</span>
                      </div>
                      <span className="preview-badge orange">Em andamento</span>
                    </div>
                    <div className="preview-list-item">
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>Queda de energia no elevador social</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Bloco A</span>
                      </div>
                      <span className="preview-badge green">Resolvido</span>
                    </div>
                  </div>

                  <div className="preview-side-panel">
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Reservas de Hoje</span>
                    <div className="preview-list-item" style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600 }}>Churrasqueira A</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>12h às 18h</span>
                    </div>
                    <div className="preview-list-item" style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600 }}>Salão Gourmet</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>19h às 23h</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'predios' && (
              <div className="preview-main-panel" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Condomínio Residencial Plaza</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Av. das Palmeiras, 1024 - Centro</span>
                  </div>
                  <span className="preview-badge green" style={{ display: 'inline-block' }}>Operando normalmente</span>
                </div>

                <div className="preview-dash-grid">
                  <div className="preview-dash-card" style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Blocos</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>3</span>
                  </div>
                  <div className="preview-dash-card" style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Unidades</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>120</span>
                  </div>
                  <div className="preview-dash-card" style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Moradores Ativos</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>98</span>
                  </div>
                  <div className="preview-dash-card" style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Prestadores</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>15</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Áreas Comuns Cadastradas</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Salão de Festas Principal', 'Churrasqueira Sul', 'Piscina Adulto', 'Quadra Poliesportiva', 'Espaço Fitness'].map((a, i) => (
                      <span key={i} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendario' && (
              <div className="preview-main-panel" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Junho 2026</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="preview-badge green">Aprovado</span>
                    <span className="preview-badge orange">Pendente</span>
                  </div>
                </div>

                <div className="preview-calendar-grid">
                  {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => (
                    <div className="preview-calendar-header-cell" key={i}>{d}</div>
                  ))}

                  {/* Empty cells for calendar layout alignment */}
                  <div className="preview-calendar-day empty"></div>
                  <div className="preview-calendar-day empty"></div>

                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">1</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">2</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">3</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">4</span>
                    <span className="preview-calendar-event green">Salão Gourmet</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">5</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">6</span>
                    <span className="preview-calendar-event orange">Churrasqueira</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">7</span>
                    <span className="preview-calendar-event blue">Quadra</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">8</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">9</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">10</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">11</span>
                  </div>
                  <div className="preview-calendar-day">
                    <span className="preview-calendar-day-num">12</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financas' && (
              <div className="preview-main-panel" style={{ flex: 1 }}>
                <div className="preview-financial-summary">
                  <div className="preview-financial-card green">
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block' }}>Entradas</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--status-green)' }}>R$ 14.250,00</span>
                    </div>
                    <TrendingUp size={20} color="var(--status-green)" />
                  </div>
                  <div className="preview-financial-card red">
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block' }}>Saídas</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--status-red)' }}>R$ 8.920,00</span>
                    </div>
                    <TrendingUp size={20} color="var(--status-red)" style={{ transform: 'rotate(90deg)' }} />
                  </div>
                  <div className="preview-financial-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block' }}>Saldo</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>R$ 5.330,00</span>
                    </div>
                    <BarChart3 size={20} color="var(--color-accent)" />
                  </div>
                </div>

                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Taxa Condominial Geral</td>
                      <td><span className="preview-badge green">Receita</span></td>
                      <td style={{ color: 'var(--status-green)', fontWeight: 600 }}>+ R$ 12.000,00</td>
                      <td>10/06/2026</td>
                    </tr>
                    <tr>
                      <td>Manutenção e Limpeza da Piscina</td>
                      <td><span className="preview-badge orange" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Despesa</span></td>
                      <td style={{ color: 'var(--status-red)', fontWeight: 600 }}>- R$ 850,00</td>
                      <td>08/06/2026</td>
                    </tr>
                    <tr>
                      <td>Conserto do Portão Garagem</td>
                      <td><span className="preview-badge orange" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Despesa</span></td>
                      <td style={{ color: 'var(--status-red)', fontWeight: 600 }}>- R$ 1.200,00</td>
                      <td>05/06/2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'chamados' && (
              <div className="preview-main-panel" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Controle de Ocorrências</span>
                  <button style={{ backgroundColor: 'var(--color-accent)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                    Novo Chamado
                  </button>
                </div>

                <div className="preview-list-item" style={{ marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>#CH-203 Lâmpadas queimadas</span>
                      <span className="preview-badge orange" style={{ padding: '2px 6px', fontSize: '9px' }}>Média</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '2px' }}>Bloco C - Corredor do 4º andar</span>
                  </div>
                  <span className="preview-badge orange">Aberto</span>
                </div>

                <div className="preview-list-item" style={{ marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>#CH-202 Infiltração teto</span>
                      <span className="preview-badge orange" style={{ padding: '2px 6px', fontSize: '9px', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Crítica</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '2px' }}>Bloco A - Garagem Subsolo 1</span>
                  </div>
                  <span className="preview-badge orange">Em andamento</span>
                </div>

                <div className="preview-list-item">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>#CH-201 Fixação corrimão escadas</span>
                      <span className="preview-badge orange" style={{ padding: '2px 6px', fontSize: '9px', backgroundColor: 'var(--bg-btn-neutral)', color: 'var(--text-light)' }}>Baixa</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '2px' }}>Área de acesso externo</span>
                  </div>
                  <span className="preview-badge green">Resolvido</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 10. Seção "Ideal Para" */}
      <section className="landing-section">
        <div className="section-header">
          <span className="section-tag">Público-Alvo</span>
          <h3 className="section-title">Para quem o SindiGo serve?</h3>
          <p className="section-subtitle">
            A plataforma flexível e ideal para diferentes modelos de gestão habitacional.
          </p>
        </div>

        <div className="ideal-grid">
          <div className="ideal-card">
            <div className="ideal-icon-box">
              <Hotel size={18} />
            </div>
            <h4 className="ideal-title">Condomínios Pequenos e Médios</h4>
          </div>

          <div className="ideal-card">
            <div className="ideal-icon-box">
              <UserCheck size={18} />
            </div>
            <h4 className="ideal-title">Síndicos Profissionais</h4>
          </div>

          <div className="ideal-card">
            <div className="ideal-icon-box">
              <Users size={18} />
            </div>
            <h4 className="ideal-title">Administradoras Condominiais</h4>
          </div>

          <div className="ideal-card">
            <div className="ideal-icon-box">
              <CheckCircle2 size={18} />
            </div>
            <h4 className="ideal-title">Moradores em busca de Transparência</h4>
          </div>

          <div className="ideal-card">
            <div className="ideal-icon-box">
              <MessageSquare size={18} />
            </div>
            <h4 className="ideal-title">Redução de barulho em Grupos de Mensagem</h4>
          </div>
        </div>
      </section>

      {/* 11. Call to Action Final */}
      <section id="contato" className="landing-section">
        <div className="cta-wrapper">
          <div className="cta-glow"></div>
          <h3 className="cta-title">Pronto para organizar a gestão do seu condomínio?</h3>
          <p className="cta-subtitle">
            Centralize chamados, reservas, atividades e finanças em uma única plataforma. Crie sua conta grátis.
          </p>
          <div className="cta-actions">
            <button className="landing-btn landing-btn-white" onClick={() => navigate('/register')}>
              Criar conta grátis
            </button>
            <button className="landing-btn landing-btn-outline" onClick={() => navigate('/login')}>
              Entrar no sistema
            </button>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="landing-footer-container">
        <div className="landing-footer">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="landing-logo">
                <div className="landing-logo-icon">
                  <Building2 size={20} color="var(--color-accent)" strokeWidth={2.5} />
                </div>
                <span className="landing-logo-text">SindiGo</span>
              </div>
              <p className="footer-desc">
                Gestão condominial simples, auditada, transparente e de ponta a ponta.
              </p>
            </div>

            <div className="footer-column">
              <h5 className="footer-col-title">Plataforma</h5>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#funcionalidades" onClick={(e) => { e.preventDefault(); scrollToSection('funcionalidades'); }}>Funcionalidades</a></li>
                <li className="footer-link-item"><a href="#beneficios" onClick={(e) => { e.preventDefault(); scrollToSection('beneficios'); }}>Benefícios</a></li>
                <li className="footer-link-item"><a href="#seguranca" onClick={(e) => { e.preventDefault(); scrollToSection('seguranca'); }}>Segurança</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h5 className="footer-col-title">Acesso</h5>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Cadastro</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <div className="footer-contact-info">
                <span>Em breve...</span>
                <span>
                  Github:{' '}
                  <a href="https://github.com/gtins" target="_blank" rel="noopener noreferrer">
                    gtins
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} SindiGo. Todos os direitos reservados.
            </p>
            <div className="footer-extra-info">
              <span>Versão 1.0</span>
              <span>•</span>
              <span>Projeto de Graduação / TCC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
