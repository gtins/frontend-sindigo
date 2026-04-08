export interface Building {
  id: number;
  name: string;
  units: number;
  tickets: number;
  lastUpdate: string;
  status: 'healthy' | 'attention' | 'warning'; // 'healthy' for 0 tickets, 'attention' for low, 'warning' for high/overdue
  statusText?: string; // Optional override text like "Inadimplências"
}

export interface Activity {
  id: number;
  type: 'maintenance' | 'inspection' | 'financial';
  title: string;
  time: string;
  isDate?: boolean; // if true, display as date (e.g. "Hoje 09:10") instead of relative time
}

export interface Ticket {
  id: string; // e.g. #T-1042
  title: string;
  status: 'priority' | 'scheduled' | 'solved';
  statusLabel: string; // e.g. "Prioridade", "Agendado"
  meta: string; // e.g. "Amanhã 10:00" or status text
}

export interface Contact {
  id: number;
  role: string;
  name: string;
  avatarUrl: string;
}

export interface BuildingDetailsData extends Building {
  address: string;
  activities: Activity[];
  ticketsList: Ticket[];
  contacts: Contact[];
  finances?: FinanceData;
}

export interface FinanceData {
  stats: {
    balance: string;
    inflow: string;
    outflow: string;
    lastConciliation: string;
  };
  period: string;
  account: string;
  transactions: Transaction[];
  summary: {
    deposits: string;
    purchases: string;
    balance: string;
    categories: { label: string; value: string; }[];
  };
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  account: string;
  value: string;
  type: 'income' | 'expense';
}

export const buildings: Building[] = [
  {
    id: 1,
    name: "Prédio 1",
    units: 120,
    tickets: 3,
    lastUpdate: "há 2h",
    status: "attention"
  },
  {
    id: 2,
    name: "Prédio 2",
    units: 86,
    tickets: 14,
    lastUpdate: "há 45 min",
    status: "attention"
  },
  {
    id: 3,
    name: "Prédio 3",
    units: 64,
    tickets: 1,
    lastUpdate: "Próximo: 12 de nov",
    status: "warning",
    statusText: "Inspeções em breve"
  },
  {
    id: 4,
    name: "Prédio 4",
    units: 40,
    tickets: 0,
    lastUpdate: "há 1 dia",
    status: "healthy"
  },
  {
    id: 5,
    name: "Prédio 5",
    units: 72,
    tickets: 9,
    lastUpdate: "há 3h",
    status: "attention", // Using ticket count logic from image
    statusText: "Inadimplências 8"
  },
  {
    id: 6,
    name: "Prédio 6",
    units: 104,
    tickets: 4,
    lastUpdate: "há 5h",
    status: "attention"
  }
];

export const buildingDetailsData: Record<number, BuildingDetailsData> = {
  1: {
    ...buildings[0],
    address: "Rua Augusta, 100 - Consolação, São Paulo - SP",
    activities: [
      { id: 1, type: 'maintenance', title: 'Chamado de manutenção criado - Elevador B', time: 'há 45 min' },
      { id: 2, type: 'inspection', title: 'Inspeção de incêndio aprovada - Andar 12', time: 'Hoje 09:10', isDate: true },
      { id: 3, type: 'financial', title: 'Saída: Pintura Externa - Outubro', time: 'Ontem', isDate: true }
    ],
    ticketsList: [
      { id: '#T-1042', title: 'Elevador B parando constantemente', status: 'priority', statusLabel: 'Prioridade', meta: '#T-1042' },
      { id: 'gaz', title: 'Ajuste de gás - Saguão', status: 'scheduled', statusLabel: 'Agendado', meta: 'Amanhã 10:00' },
      { id: 'leak', title: 'Vazamento reportado - Unidade 801', status: 'solved', statusLabel: 'Resolvido', meta: 'Aguardando confirmação' }
    ],
    contacts: [
      { id: 1, role: 'Gerente no local', name: 'Maria', avatarUrl: 'https://i.pravatar.cc/150?u=maria' },
      { id: 2, role: 'Superintendente', name: 'Henrique', avatarUrl: 'https://i.pravatar.cc/150?u=henrique' },
      { id: 3, role: 'Contadora', name: 'Nathalia', avatarUrl: 'https://i.pravatar.cc/150?u=nathalia' }
    ],
    finances: {
      stats: {
        balance: 'R$ 128.450,32',
        inflow: 'R$ 42.800,00',
        outflow: 'R$ 31.250,00',
        lastConciliation: 'há 3 dias'
      },
      period: 'Out 2025',
      account: 'Conta corrente',
      transactions: [
        { id: '1', date: '02/10/2025', description: 'Depósito de condomínio - Outubro', category: 'Receitas', account: 'Conta corrente', value: '+ R$ 25.600,00', type: 'income' },
        { id: '2', date: '04/10/2025', description: 'Compra de materiais - Pintura externa', category: 'Manutenção', account: 'Conta corrente', value: '- R$ 12.300,00', type: 'expense' },
        { id: '3', date: '07/10/2025', description: 'Depósito - Aluguel salão de festas', category: 'Reservas', account: 'Conta corrente', value: '+ R$ 1.800,00', type: 'income' },
        { id: '4', date: '10/10/2025', description: 'Serviço de elevadores - contrato mensal', category: 'Serviços', account: 'Conta corrente', value: '- R$ 8.900,00', type: 'expense' },
        { id: '5', date: '12/10/2025', description: 'Depósito - Multa condominial', category: 'Outras receitas', account: 'Conta corrente', value: '+ R$ 600,00', type: 'income' },
        { id: '6', date: '14/10/2025', description: 'Compra de extintores', category: 'Segurança', account: 'Conta corrente', value: '- R$ 3.450,00', type: 'expense' },
        { id: '7', date: '16/10/2025', description: 'Depósito - Ajuste de rateio', category: 'Receitas', account: 'Conta corrente', value: '+ R$ 2.500,00', type: 'income' }
      ],
      summary: {
        deposits: 'R$ 30.500,00',
        purchases: 'R$ 24.650,00',
        balance: 'R$ 5.850,00',
        categories: [
          { label: 'Manutenção', value: 'R$ 12.300,00' },
          { label: 'Serviços', value: 'R$ 8.900,00' },
          { label: 'Reservas', value: 'R$ 1.800,00' }
        ]
      }
    }
  }
};
