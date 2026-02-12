/**
 * Regras de validação para anúncios
 * Sincronizadas com backend (ad.dto.ts)
 */

interface BaseRule {
  required?: boolean;
  messages?: Record<string, string>;
}

interface StringRule extends BaseRule {
  minLength?: number;
  maxLength?: number;
}

interface NumberRule extends BaseRule {
  min?: number;
  max?: number;
}

interface EnumRule extends BaseRule {
  values: string[];
  default?: string;
  labels?: Record<string, string>;
}

type ValidationRule = StringRule | NumberRule | EnumRule;

export const AD_VALIDATION_RULES: Record<string, ValidationRule> = {
  title: {
    minLength: 5,
    maxLength: 100,
    required: true,
    messages: {
      required: 'Título é obrigatório',
      minLength: 'Título deve ter no mínimo 5 caracteres',
      maxLength: 'Título deve ter no máximo 100 caracteres',
      type: 'Título deve ser uma string válida',
    },
  },
  description: {
    minLength: 20,
    maxLength: 5000,
    required: true,
    messages: {
      required: 'Descrição é obrigatória',
      minLength: 'Descrição deve ter no mínimo 20 caracteres',
      maxLength: 'Descrição deve ter no máximo 5000 caracteres',
      type: 'Descrição deve ser uma string válida',
    },
  },
  price: {
    min: 0,
    max: 99999999,
    required: true,
    messages: {
      required: 'Preço é obrigatório',
      min: 'Preço não pode ser negativo',
      max: 'Preço inválido (máximo: 99.999.999)',
      type: 'Preço deve ser um número válido',
    },
  },
  categoryId: {
    required: true,
    messages: {
      required: 'Categoria é obrigatória',
      type: 'Categoria deve ser uma string válida',
    },
  },
  location: {
    minLength: 2,
    required: true,
    messages: {
      required: 'Localidade é obrigatória',
      minLength: 'Localidade inválida (mínimo 2 caracteres)',
      type: 'Localidade deve ser uma string válida',
    },
  },
  city: {
    minLength: 2,
    required: true,
    messages: {
      required: 'Cidade é obrigatória',
      minLength: 'Cidade inválida (mínimo 2 caracteres)',
      type: 'Cidade deve ser uma string válida',
    },
  },
  country: {
    minLength: 2,
    required: true,
    messages: {
      required: 'País é obrigatório',
      minLength: 'País inválido (mínimo 2 caracteres)',
      type: 'País deve ser uma string válida',
    },
  },
  currency: {
    values: ['XOF', 'USD', 'EUR'],
    default: 'XOF',
    required: false,
  },
  condition: {
    values: ['new', 'like_new', 'used', 'for_repair'],
    default: 'used',
    required: false,
    labels: {
      new: 'Novo',
      like_new: 'Como novo',
      used: 'Usado',
      for_repair: 'Para reparar',
    },
  },
};

/**
 * Validar campo individual
 */
export function validateField(fieldName: string, value: any): string | null {
  const rules = AD_VALIDATION_RULES[fieldName];

  if (!rules) {
    return null;
  }

  // Verificar se é obrigatório
  if (rules.required && !value) {
    return rules.messages?.required || `${fieldName} é obrigatório`;
  }

  // Validar comprimento (string)
  if (typeof value === 'string') {
    const stringRule = rules as StringRule;
    if (stringRule.minLength && value.length < stringRule.minLength) {
      return stringRule.messages?.minLength || `Mínimo ${stringRule.minLength} caracteres`;
    }
    if (stringRule.maxLength && value.length > stringRule.maxLength) {
      return stringRule.messages?.maxLength || `Máximo ${stringRule.maxLength} caracteres`;
    }
  }

  // Validar número
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = typeof value === 'number' ? value : Number(value);
    const numberRule = rules as NumberRule;
    if (numberRule.min !== undefined && numValue < numberRule.min) {
      return numberRule.messages?.min || `Mínimo ${numberRule.min}`;
    }
    if (numberRule.max !== undefined && numValue > numberRule.max) {
      return numberRule.messages?.max || `Máximo ${numberRule.max}`;
    }
  }

  // Validar valores enum
  const enumRule = rules as EnumRule;
  if (enumRule.values && !enumRule.values.includes(value)) {
    return `${fieldName} contém um valor inválido`;
  }

  return null;
}

/**
 * Validar formulário completo
 */
export function validateForm(formData: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};

  const fieldsToValidate = ['title', 'description', 'price', 'categoryId', 'location', 'city', 'country'];

  fieldsToValidate.forEach((field) => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

/**
 * Obter label legível para campo
 */
export function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    title: 'Título',
    description: 'Descrição',
    price: 'Preço',
    categoryId: 'Categoria',
    location: 'Localidade',
    city: 'Cidade',
    country: 'País',
    currency: 'Moeda',
    condition: 'Condição',
  };

  return labels[fieldName] || fieldName;
}

/**
 * Obter dica de preenchimento
 */
export function getFieldHint(fieldName: string): string {
  const hints: Record<string, string> = {
    title: 'Máximo 100 caracteres. Seja descritivo!',
    description: 'Mínimo 20, máximo 5000 caracteres. Detalhe bem o produto.',
    price: 'Preço em XOF. Deixe em branco para gratuito.',
    categoryId: 'Escolha a categoria que melhor descreve o produto.',
    location: 'Bairro ou localidade específica.',
    city: 'Cidade onde está o produto.',
    country: 'País. Padrão: Guiné-Bissau',
    condition: 'Estado em que se encontra o produto.',
  };

  return hints[fieldName] || '';
}
