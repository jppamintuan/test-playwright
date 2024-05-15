import { faker } from '@faker-js/faker';

export function newSupplier() {
  return {
    firstname: faker.person.firstName(),
    username: faker.internet.userName(),
    abn: faker.finance.accountNumber(11),
    tradingName: faker.company.name()
  };
}