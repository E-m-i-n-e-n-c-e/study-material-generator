export interface Module {
  id: string;
  name: string;
  description: string;
  passageIds: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
}

export const modules: Module[] = [
  {
    id: 'economics',
    name: 'Economics',
    description: 'Fundamental concepts in economics and market principles',
    passageIds: ['easy-01'],
    difficulties: ['easy']
  },
  {
    id: 'life-sciences',
    name: 'Life Sciences',
    description: 'Biology, ecology, and environmental topics',
    passageIds: ['easy-02', 'easy-03'],
    difficulties: ['easy']
  },
  {
    id: 'physical-sciences',
    name: 'Physical Sciences',
    description: 'Physics, astronomy, and space exploration',
    passageIds: ['medium-01'],
    difficulties: ['medium']
  },
  {
    id: 'technology',
    name: 'Technology & Computing',
    description: 'Computer science, internet history, and emerging technologies',
    passageIds: ['medium-02', 'hard-01'],
    difficulties: ['medium', 'hard']
  }
];

export const getModuleById = (moduleId: string): Module | undefined => {
  return modules.find(m => m.id === moduleId);
};

export const getModulesList = () => {
  return modules.map(({ id, name, description, difficulties }) => ({
    id,
    name,
    description,
    difficulties
  }));
};
