import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CREDIT_PACKAGES } from '../constants';
import { CreditPackage } from '../types';
import Button from './Button';
import { SparklesIcon, PayoneerIcon, CheckCircleIcon, MailIcon, SendIcon } from './Icons';
import { toast } from '../hooks/useToast';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitCreditRequest } = useAuth();
  const [step, setStep] = useState<'instructions' | 'form'>('instructions');
  const [paymentMethod, setPaymentMethod] = useState<'payoneer' | 'other'>('payoneer');

  // Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('instructions');
      setPaymentMethod('payoneer');
      setTransactionId('');
      setAmountPaid('');
      setPaymentDate('');
      setSelectedPackage(CREDIT_PACKAGES[0]);
      if (currentUser) {
          setName(currentUser.name);
          setEmail(currentUser.email);
      }
    }
  }, [isOpen, currentUser]);
  
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || !amountPaid.trim() || !paymentDate) {
        toast.error("Please fill all required fields.");
        return;
    }
    setIsSubmitting(true);
    const success = await submitCreditRequest({
        transactionId,
        amountPaid: parseFloat(amountPaid),
        creditPackage: selectedPackage,
        paymentDate,
    });
    setIsSubmitting(false);
    if(success) {
        onClose();
    }
  };

  const handleClose = () => {
    setStep('instructions');
    onClose();
  }

  if (!isOpen) return null;

  const renderContent = () => {
    if (step === 'instructions') {
      return (
        <>
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Purchase Credits</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Choose a payment method. All payments are verified manually before credits are added.
                </p>
            </div>
            <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    {CREDIT_PACKAGES.map(pkg => (
                        <div key={pkg.credits} className="p-3 bg-gray-50 dark:bg-gray-900/50 border rounded-lg dark:border-gray-700">
                            <p className="font-bold text-blue-600 dark:text-blue-400">{pkg.credits} Credits</p>
                            <p className="text-sm font-semibold">${pkg.price}</p>
                            <p className="text-xs text-gray-500">{pkg.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setPaymentMethod('payoneer')}
                        className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${paymentMethod === 'payoneer' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
                    >
                        <PayoneerIcon className="w-5 h-5" />
                        <span>Pay with Payoneer</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('other')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${paymentMethod === 'other' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
                    >
                        Bank / PayPal / Other
                    </button>
                </nav>
            </div>

            {paymentMethod === 'payoneer' && (
                <div className="space-y-3 text-sm p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-base text-gray-800 dark:text-gray-200">Instructions for Payoneer</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        1. Manually transfer the correct amount for your chosen credit package to the account below.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md font-mono text-blue-800 dark:text-blue-300">
                        <p><strong>Payoneer USD Account:</strong></p>
                        <p>70582770001401348</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        2. After payment, click the "Submit Payment Details" button below and fill out the form with your transaction details.
                    </p>
                </div>
            )}

            {paymentMethod === 'other' && (
                <div className="space-y-3 text-sm p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-base text-gray-800 dark:text-gray-200">Alternative Payment Methods</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        If you cannot use Payoneer, you can send payment proof via email. We accept Bank Transfers, PayPal, and others on a case-by-case basis.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
                        <p><strong>Email:</strong> <a href="mailto:ubaidjfh@gmail.com" className="font-mono text-blue-800 dark:text-blue-300 hover:underline">ubaidjfh@gmail.com</a></p>
                        <p className="font-semibold mt-2">Include in your email:</p>
                        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                            <li>Your DOT.AI Name</li>
                            <li>Amount Paid & Credit Package Selected</li>
                            <li>Transaction ID or Reference Number</li>
                            <li>A screenshot or proof of payment</li>
                        </ul>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Note: This method is manual. There is no need to use the submission form if you email us.
                    </p>
                </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {paymentMethod === 'payoneer' && (
                    <Button onClick={() => setStep('form')} className="w-full">
                        <SendIcon className="w-4 h-4 mr-2" />
                        Submit Payoneer Details
                    </Button>
                )}
                <Button variant="secondary" onClick={handleClose} className="w-full">
                    {paymentMethod === 'payoneer' ? 'Cancel' : 'Close'}
                </Button>
            </div>
        </>
      );
    }

    if (step === 'form') {
        return (
            <>
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Submit Payment Request</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                       Enter your payment details below for verification.
                    </p>
                </div>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Name" type="text" value={name} onChange={setName} required disabled={!!currentUser} />
                        <FormInput label="Email" type="email" value={email} onChange={setEmail} required disabled={!!currentUser} />
                     </div>
                     <FormInput label="Payoneer Transaction ID" type="text" value={transactionId} onChange={setTransactionId} placeholder="e.g., 123456789" required />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Amount Paid (USD)" type="number" value={amountPaid} onChange={setAmountPaid} placeholder="e.g., 9" required />
                        <FormInput label="Date of Payment" type="date" value={paymentDate} onChange={setPaymentDate} required />
                     </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Selected Credit Package</label>
                        <select
                            value={selectedPackage.credits}
                            onChange={(e) => setSelectedPackage(CREDIT_PACKAGES.find(p => p.credits === parseInt(e.target.value))!)}
                            required
                            className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                        >
                            {CREDIT_PACKAGES.map(pkg => (
                                <option key={pkg.credits} value={pkg.credits}>
                                    {pkg.credits} Credits for ${pkg.price}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? 'Submitting...' : <><SendIcon className="w-4 h-4 mr-2" /> Submit for Approval</>}
                        </Button>
                        <Button variant="secondary" onClick={() => setStep('instructions')} className="w-full">
                            Back
                        </Button>
                     </div>
                </form>
            </>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full m-4 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s forwards' }}
      >
        <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        {renderContent()}
      </div>
    </div>
  );
};

const FormInput: React.FC<{label: string, type: string, value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean, disabled?: boolean}> = ({ label, type, value, onChange, placeholder, required, disabled }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
        />
    </div>
);


export default Modal;