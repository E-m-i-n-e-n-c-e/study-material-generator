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
    passageIds: ['easy-01', 'medium-03', 'hard-02'],
    difficulties: ['easy', 'medium', 'hard']
  },
  {
    id: 'life-sciences',
    name: 'Life Sciences',
    description: 'Biology, ecology, and environmental topics',
    passageIds: ['easy-02', 'medium-04', 'hard-03'],
    difficulties: ['easy', 'medium', 'hard']
  },
  {
    id: 'physical-sciences',
    name: 'Physical Sciences',
    description: 'Physics, astronomy, and space exploration',
    passageIds: ['easy-04', 'medium-01', 'hard-04'],
    difficulties: ['easy', 'medium', 'hard']
  },
  {
    id: 'technology',
    name: 'Technology & Computing',
    description: 'Computer science, internet history, and emerging technologies',
    passageIds: ['easy-05', 'medium-02', 'hard-01'],
    difficulties: ['easy', 'medium', 'hard']
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
