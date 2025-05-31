#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Payment {
    pub source: Address,
    pub destination: Address,
    pub amount: i128,
    pub asset: Symbol,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Trustline {
    pub account: Address,
    pub asset: Symbol,
    pub limit: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Balance {
    pub asset: Symbol,
    pub amount: i128,
    pub limit: i128,
}

#[contract]
pub struct StellarRemitContract;

#[contractimpl]
impl StellarRemitContract {
    // Ödeme işlemi
    pub fn create_payment(
        env: &Env,
        source: Address,
        destination: Address,
        amount: i128,
        asset: Symbol,
    ) -> Result<(), Error> {
        // Yetki kontrolü
        source.require_auth();

        // Bakiye kontrolü
        let source_balance = Self::get_balance(env, source.clone(), asset.clone())?;
        if source_balance.amount < amount {
            return Err(Error::InsufficientBalance);
        }

        // Ödeme işlemini gerçekleştir
        let payment = Payment {
            source: source.clone(),
            destination: destination.clone(),
            amount,
            asset: asset.clone(),
        };

        // İşlemi kaydet
        env.storage().instance().set(&symbol_short!("payment"), &payment);

        // Bakiyeleri güncelle
        Self::update_balance(env, source, asset.clone(), -amount)?;
        Self::update_balance(env, destination, asset, amount)?;

        Ok(())
    }

    // Bakiye sorgulama
    pub fn get_balance(env: &Env, account: Address, asset: Symbol) -> Result<Balance, Error> {
        let balance_key = (account, asset);
        env.storage()
            .instance()
            .get(&balance_key)
            .unwrap_or(Balance {
                asset: asset.clone(),
                amount: 0,
                limit: 0,
            })
    }

    // Trustline oluşturma
    pub fn create_trustline(
        env: &Env,
        account: Address,
        asset: Symbol,
        limit: i128,
    ) -> Result<(), Error> {
        // Yetki kontrolü
        account.require_auth();

        let trustline = Trustline {
            account: account.clone(),
            asset: asset.clone(),
            limit,
        };

        // Trustline'ı kaydet
        env.storage()
            .instance()
            .set(&symbol_short!("trustline"), &trustline);

        Ok(())
    }

    // İşlem detaylarını getir
    pub fn get_transaction_details(env: &Env, payment_id: Symbol) -> Result<Payment, Error> {
        env.storage()
            .instance()
            .get(&payment_id)
            .ok_or(Error::TransactionNotFound)
    }

    // Yardımcı fonksiyonlar
    fn update_balance(
        env: &Env,
        account: Address,
        asset: Symbol,
        amount: i128,
    ) -> Result<(), Error> {
        let mut balance = Self::get_balance(env, account.clone(), asset.clone())?;
        balance.amount += amount;

        // Limit kontrolü
        if balance.amount > balance.limit {
            return Err(Error::ExceedsLimit);
        }

        let balance_key = (account, asset);
        env.storage().instance().set(&balance_key, &balance);

        Ok(())
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Error {
    InsufficientBalance,
    ExceedsLimit,
    TransactionNotFound,
    Unauthorized,
}

impl From<Error> for soroban_sdk::Error {
    fn from(e: Error) -> Self {
        soroban_sdk::Error::from_type_and_code(1, e as u32)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_create_payment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StellarRemitContract);
        let client = StellarRemitContractClient::new(&env, &contract_id);

        let source = Address::generate(&env);
        let destination = Address::generate(&env);
        let asset = symbol_short!("XLM");

        // Trustline oluştur
        client.with_source_account(&source).create_trustline(
            &source,
            &asset,
            &1000,
        );

        // Ödeme yap
        client.with_source_account(&source).create_payment(
            &source,
            &destination,
            &100,
            &asset,
        );

        // Bakiyeleri kontrol et
        let source_balance = client.get_balance(&source, &asset);
        let dest_balance = client.get_balance(&destination, &asset);

        assert_eq!(source_balance.amount, 900);
        assert_eq!(dest_balance.amount, 100);
    }

    #[test]
    #[should_panic(expected = "InsufficientBalance")]
    fn test_insufficient_balance() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StellarRemitContract);
        let client = StellarRemitContractClient::new(&env, &contract_id);

        let source = Address::generate(&env);
        let destination = Address::generate(&env);
        let asset = symbol_short!("XLM");

        // Yetersiz bakiye ile ödeme yapmaya çalış
        client.with_source_account(&source).create_payment(
            &source,
            &destination,
            &100,
            &asset,
        );
    }
} 