import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    CreditCard,
    ShieldCheck,
    Lock,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Zap,
    Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { paymentApi, appointmentApi } from '../lib/api';

const PaymentPage = () => {
    const router = useRouter();
    const { appointmentId, amount, patientId, doctorId } = router.query;
    const id = appointmentId; // alias for internal use
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [payData, setPayData] = useState(null);

    const handleInitiatePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const cleanAppointmentId = typeof id === 'string' ? id.replace('APT-', '') : id;

            // Step 1: Create payment record in payment-service
            const createRes = await paymentApi.post('/create', {
                appointmentId: cleanAppointmentId,
                patientId: patientId,
                amount: amount || 2000,
                doctorId: doctorId,
                method: 'PAYHERE',
                currency: 'LKR'
            });

            const paymentId = createRes.data.data.paymentId;

            // Step 2: Get PayHere form data
            const initRes = await paymentApi.get(`/${paymentId}/initiate-payhere`, {
                params: {
                    returnUrl: `${window.location.origin}/dashboard/patient?payment=success&appointmentId=${cleanAppointmentId}`,
                    cancelUrl: `${window.location.origin}/payment?appointmentId=${cleanAppointmentId}&amount=${amount}&patientId=${patientId}&doctorId=${doctorId}&payment=cancelled`
                }
            });

            setPayData(initRes.data.data);

            // Step 3: Auto-submit the PayHere form
            setTimeout(() => {
                document.getElementById('payhere-form').submit();
            }, 800);

        } catch (err) {
            console.error('Payment initiation failed', err);
            setError(err.response?.data?.message || 'Payment initiation failed. Please retry.');
            setLoading(false);
        }
    };

    if (!appointmentId && !loading && !payData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 selection:bg-teal-100">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="max-w-md w-full text-center p-12 shadow-2xl shadow-slate-200">
                        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-100">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Invalid Protocol</h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">We could not identify the required clinical markers for this payment session.</p>
                        <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/dashboard/patient')}>
                            Return to Hub
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Secure Settlement Protocol | Payment Gateway | SynapsCare</title>
                <meta name="description" content="Authorize secure financial transactions for specialized clinical services" />
            </Head>
            <div className="min-h-screen lg:h-screen bg-white flex flex-col lg:flex-row font-sans selection:bg-teal-100 overflow-hidden">
                {/* Left: Summary & Branding (Fixed on desktop) */}
                <div className="lg:w-[450px] xl:w-[550px] bg-slate-900 lg:h-screen lg:sticky lg:top-0 p-12 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none group translate-x-10 -translate-y-10">
                        <Wallet size={400} strokeWidth={1} className="text-teal-400 group-hover:rotate-12 transition-transform duration-1000" />
                    </div>

                    <div className="relative z-10">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-4 text-slate-400 hover:text-white transition-all mb-16 text-xs font-bold tracking-tight group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                                <ChevronLeft size={16} />
                            </div>
                            Abort Payment
                        </button>

                        <div className="space-y-10">
                            <div>
                                <Badge variant="success" className="mb-6">SECURE CHECKOUT NODE</Badge>
                                <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">Settlement <br /> <span className="text-teal-500">Protocol.</span></h1>
                                <p className="text-slate-400 font-medium text-lg max-w-sm leading-relaxed">Authorization for specialized medical consultation services.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-md">
                                    <h3 className="text-sm font-bold tracking-tight text-slate-500 mb-6">Financial Ledger Summary</h3>
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-400">Consultation Session</span>
                                            <span className="text-sm font-black text-white">LKR {parseFloat(amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-400">Node Maintenance Fee</span>
                                            <span className="text-sm font-black text-emerald-500">INCL.</span>
                                        </div>
                                        <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold tracking-tight text-slate-500">Total Settlement</span>
                                                <span className="text-3xl font-black text-white tracking-tighter mt-1">LKR {parseFloat(amount || 0).toLocaleString()}</span>
                                            </div>
                                            <CheckCircle2 className="text-teal-500 mb-2" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 flex items-center justify-between text-[10px] font-bold tracking-tight text-slate-500 border-t border-white/5 pt-8">
                        <span>SynapseCare Financial v1.4</span>
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-emerald-500" /> Secure
                        </div>
                    </div>
                </div>

                {/* Right: Payment Method Integration */}
                <main className="flex-1 lg:h-screen overflow-y-auto bg-slate-50 p-6 lg:p-24 flex items-start justify-center">
                    <div className="max-w-xl w-full space-y-12">
                        <AnimatePresence mode="wait">
                            {!payData ? (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Execute <span className="text-teal-600">Payment.</span></h2>
                                        <p className="text-slate-500 font-medium">Select a secure clearing node to finalize your clinical session.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Progression Indicator */}
                                        <div className="grid grid-cols-3 gap-4 mb-10">
                                            {[
                                                { l: 'Identity', s: 'done' },
                                                { l: 'Balance', s: 'active' },
                                                { l: 'Review', s: 'pending' }
                                            ].map((st, i) => (
                                                <div key={i} className="space-y-3">
                                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${st.s === 'done' ? 'bg-teal-600' : st.s === 'active' ? 'bg-teal-300' : 'bg-slate-200'}`} />
                                                    <span className={`text-[10px] font-bold tracking-tight ${st.s === 'pending' ? 'text-slate-300' : 'text-slate-900'}`}>{st.l}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="surface-card p-10 bg-white space-y-10 group hover:border-teal-100 transition-all border border-transparent shadow-2xl shadow-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-teal-400 shadow-xl shadow-slate-200 transform group-hover:rotate-12 transition-transform">
                                                    <CreditCard size={28} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-tight text-slate-400 mb-1">Payment Infrastructure</p>
                                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">PayHere Gateway</h4>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-center">
                                                    <div className="h-6 w-16 rounded bg-white border border-slate-200 flex items-center justify-center gap-1.5">
                                                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                                                        <span className="w-3 h-3 rounded-full bg-amber-500 -ml-1.5" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-tight">MasterCard Link</p>
                                                </div>
                                                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-center">
                                                    <div className="h-6 w-16 rounded bg-linear-to-r from-blue-700 to-indigo-700 text-white text-[8px] font-black tracking-tight flex items-center justify-center">
                                                        VISA
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-tight">VISA Secure</p>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-4">
                                                    <AlertCircle className="text-rose-500 shrink-0 mt-1" size={20} />
                                                    <p className="text-xs font-bold text-rose-800 leading-relaxed">"{error}"</p>
                                                </div>
                                            )}

                                            <Button
                                                variant="primary"
                                                size="xl"
                                                loading={loading}
                                                onClick={handleInitiatePayment}
                                                className="w-full"
                                                icon={Zap}
                                            >
                                                Initalize Secure Settlement
                                            </Button>
                                        </div>

                                        <div className="p-8 rounded-[2.5rem] bg-teal-50 border border-teal-100 flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                                                <ShieldCheck size={22} />
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed">"Our financial infrastructure is protected by 256-bit encryption and specialized medical cloud security protocols."</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-10">
                                    <div className="w-32 h-32 bg-teal-600 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-2xl shadow-teal-100 animate-bounce">
                                        <Zap size={64} fill="white" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Connecting to Hub...</h3>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Please do not refresh. Synchronizing with the secure PayHere financial grid.</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                className="w-2 h-2 rounded-full bg-teal-600"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>

                {/* Hidden PayHere Strategy Form */}
                {payData && (
                    <form id="payhere-form" method="post" action="https://sandbox.payhere.lk/pay/checkout">
                        <input type="hidden" name="merchant_id" value={payData.merchant_id} />
                        <input type="hidden" name="return_url" value={payData.return_url} />
                        <input type="hidden" name="cancel_url" value={payData.cancel_url} />
                        <input type="hidden" name="notify_url" value={payData.notify_url} />
                        <input type="hidden" name="order_id" value={payData.order_id} />
                        <input type="hidden" name="items" value={payData.items} />
                        <input type="hidden" name="currency" value={payData.currency} />
                        <input type="hidden" name="amount" value={payData.amount} />
                        <input type="hidden" name="first_name" value={payData.first_name} />
                        <input type="hidden" name="last_name" value={payData.last_name} />
                        <input type="hidden" name="email" value={payData.email} />
                        <input type="hidden" name="phone" value={payData.phone} />
                        <input type="hidden" name="address" value={payData.address} />
                        <input type="hidden" name="city" value={payData.city} />
                        <input type="hidden" name="country" value={payData.country} />
                        <input type="hidden" name="hash" value={payData.hash} />
                        <input type="hidden" name="sandbox" value="true" />
                    </form>
                )}
            </div>
        </>
    );
};

export default PaymentPage;
