import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber"
import { refund, refundNonPsf, refundPsf } from "../../../api/pos/common"
import * as payrun from "../../../api/payment_approval/payments_payrun/common"
import * as paymentProfile from "../../../api/payment_approval/payment_profile/common"
import * as postgres from '../../../src/utils/postgres'

setDefaultTimeout(60 * 10000)

Given('Test Something', async function () {
    // await refund();
    // await payrun.createPayrun();
    // await payrun.getPayrun('CREATED');
    // await payrun.getPayrunSummary();
    // await payrun.getRecipientsByPayrun('PENDING_APPROVAL');
    // await payrun.updatePaymentStatus('HOLD');
    // await payrun.getPaymentFullDetails();
    // await payrun.getPaymentSummary();
    // await payrun.getOutstandingPaymentSummary();
    // await payrun.getPaymentsWithNoPayrun();
    // await payrun.approvePayrun();
    // await payrun.getPayrun('APPROVED');

    // await paymentProfile.vicIndividualCustomerCreation();
    // await paymentProfile.createBankPaymentProfile(paymentProfile.vicIndividualCustomerID);
    // await paymentProfile.createBankPaymentProfile(paymentProfile.vicIndividualCustomerID);
    // await paymentProfile.verifyPaymentProfileIsCreated(paymentProfile.vicIndividualCustomerID, paymentProfile.bankId, "BANK");
    // await paymentProfile.updatePaymentProfileToDefault(paymentProfile.vicIndividualCustomerID, paymentProfile.bankId);
    // await paymentProfile.deletePaymentProfile(paymentProfile.vicIndividualCustomerID, paymentProfile.bankId);
    // await paymentProfile.verifyPaymentProfileIsDeleted(paymentProfile.vicIndividualCustomerID, paymentProfile.bankId);

    // await paymentProfile.vicIndividualCustomerCreation();
    // await paymentProfile.createDelegatePaymentProfile(paymentProfile.vicIndividualCustomerID);
    // await paymentProfile.createDelegatePaymentProfile(paymentProfile.vicIndividualCustomerID);
    // await paymentProfile.verifyPaymentProfileIsCreated(paymentProfile.vicIndividualCustomerID, paymentProfile.delegateId, "DELEGATE");
    // await paymentProfile.updatePaymentProfileToDefault(paymentProfile.vicIndividualCustomerID, paymentProfile.delegateId);
    // await paymentProfile.deletePaymentProfile(paymentProfile.vicIndividualCustomerID, paymentProfile.delegateId);
    // await paymentProfile.verifyPaymentProfileIsDeleted(paymentProfile.vicIndividualCustomerID, paymentProfile.delegateId);

    // await paymentProfile.vicGroupCustomerCreation();
    // await paymentProfile.createUnapprovedBank(paymentProfile.vicGroupCustomerID);
    // await paymentProfile.verifyPaymentProfileIsCreated(paymentProfile.vicGroupCustomerID, paymentProfile.unapprovedBankId, "BANK");
    // await paymentProfile.approveBank(paymentProfile.vicGroupCustomerID, paymentProfile.unapprovedBankId);
    // await paymentProfile.updateApprovedBankToDefault(paymentProfile.vicGroupCustomerID, paymentProfile.unapprovedBankId);
    // await paymentProfile.approveGroup(paymentProfile.vicGroupCustomerID);

    // await paymentProfile.vicGroupCustomerCreation();
    // await paymentProfile.invalidBsbAccountNumberBankCreation(paymentProfile.vicGroupCustomerID);
    // await paymentProfile.mismatchPayloadBank(paymentProfile.vicGroupCustomerID);
    // await paymentProfile.mismatchPayloadPayPal(paymentProfile.vicGroupCustomerID);
    // await paymentProfile.mismatchPayloadDelegate(paymentProfile.vicGroupCustomerID);

    // await refundNonPsf("CASH", true, true);

    // await refundPsf("TOTAL", true, true, true);

    await postgres.testSelect1();
});