
import { User, Incident } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    role: 'Supervisor N2',
    email: 'carlos.silva@claro.com.br',
    status: 'active',
    address: 'Avenida Paulista, 1000, São Paulo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3YFHCn1shQRo4Wz2i6z1icWoM6ROXaU9rI2ipeeNr7jS1RQremhudV6vkyM9ZP-Rze-GQOcS6ooSoyf8NLoBb6YHZBkHXIBZW12xH5hsBZE9z4dA9YmO4G3AnCs26jZc49GPjBiHSzqczFX6Nae0n7vZJfUnvJGLa93LYTedcHWTNftLjg7BVqakqFxWOET3OV8RikTfKjCFxgWj5jI_c1M59Tx0IKdSKUY_DtDbyVSCv-BIiojzZloeJHccpAazmyYgsLTAwum8'
  },
  {
    id: '2',
    name: 'Ana Souza',
    role: 'Operador NOC',
    email: 'ana.souza@claro.com.br',
    status: 'active',
    address: 'Rua Augusta, 500, São Paulo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_f3jr0RUKVz11xdsEx6ydpfpZtwhQtjyiA6q0x5rD0pCvZxuU3S6_pP-ODDxBPIStEiF68dgTIP5C0eF4FUNFBFSk7pQOfjni8vDyBgopLHqme4nvVK62T13MG5JxMnA201bzFvZT6-SYLkit-F8FYxWvBvA0QRj47hnGyUnvixkM1EkmY07NM0RQn159Vkf5Hpia_2PWLYv0aqMHT1ZfCccMiQnEGmQKn_wxIwcTE_KXXQDFvHzSu1xc1cH74qlGrz5Y8nFEgVI'
  },
  {
    id: '3',
    name: 'Roberto Mendes',
    role: 'Técnico de Campo',
    email: 'roberto.m@claro.com.br',
    status: 'inactive',
    address: 'Avenida Faria Lima, 2000, São Paulo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA157CZuvnzbfI5UtLaVaNhp5anh5xmBGQ-qTQj7p6eW49J1YG-L69IitfPTPDgCvh6cpXaDhOlnO1Zyjkhv8JCF1xtFmMbm1F6VMHgNE62s7lleugjDofebgpTxK_ev55I3JHfy53LY6Usg0SkhChXE-8xginkgQ_5KSRv9CMy2UFLzGkbcTRcLnBad6opcFCMZtjWpK9oEN3jg7B5MxOCd8vyE26UMg6WQt-aVXmcepLilxyJ4M3t_Stm0RY6nJAYROk01Z7nKLA'
  },
  {
    id: '4',
    name: 'Juliana Paes',
    role: 'Gestão Operacional',
    email: 'juliana.paes@claro.com.br',
    status: 'active',
    address: 'Rua Oscar Freire, 300, São Paulo',
    initials: 'JP'
  }
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-9283',
    title: 'Rompimento Massivo',
    location: 'Região Sul - Node SJ04',
    time: '10:42',
    status: 'critical',
    type: 'massive'
  },
  {
    id: 'INC-9284',
    title: 'Degradação de Sinal',
    location: 'Bairro Centro - Alta Latência',
    time: '10:15',
    status: 'pending',
    type: 'degradation'
  }
];
