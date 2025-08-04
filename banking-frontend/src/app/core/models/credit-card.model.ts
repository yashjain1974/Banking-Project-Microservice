export interface CreditCard {
  cardId: string;
  userId: string;
  accountId: string;
  cardNumber: string;
  cardType: CardType;
  issueDate: string;
  expiryDate: string;
  status: CardStatus;
  transactionLimit: number;
  createdAt: string;
}

export interface CreditCardRequest {
  userId: string;
  accountId: string;
  cardType: CardType;
  transactionLimit: number;
  issueDate: string;
  cardNumber: string;
  expiryDate: string;
}

export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMERICAN_EXPRESS = 'AMERICAN_EXPRESS',
  DISCOVER = 'DISCOVER',
  RUPAY = 'RUPAY'
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED'
}