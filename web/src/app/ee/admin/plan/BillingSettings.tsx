"use client";

import { useRouter } from "next/navigation";
import { BillingPlanType } from "@/app/admin/settings/interfaces";
import { useContext, useState } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  Label,
  SubLabel,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { Button, Divider, Text, Card } from "@tremor/react";
import Link from "next/link";
import { StripeCheckoutButton } from "./StripeCheckoutButton";
import { CheckmarkIcon, XIcon } from "@/components/icons/icons";
import { FiAward, FiDollarSign, FiStar } from "react-icons/fi";
// import { StripeCheckoutButton } from "@/components/StripeButton";

export function BillingSettings() {
  const router = useRouter();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const settings = useContext(SettingsContext);
  const cloudSettings = settings?.cloudSettings;

  if (!cloudSettings) {
    return null;
  }

  // Use actual data from cloudSettings
  const currentPlan = cloudSettings?.planType;
  const seats = cloudSettings?.numberOfSeats!;
  const features = [
    { name: "All Connector Access", included: true },
    { name: "Basic Support", included: true },
    { name: "Custom Branding", included: currentPlan !== BillingPlanType.FREE },
    {
      name: "Analytics Dashboard",
      included: currentPlan !== BillingPlanType.FREE,
    },
    { name: "Query History", included: currentPlan !== BillingPlanType.FREE },
    {
      name: "Priority Support",
      included: currentPlan !== BillingPlanType.FREE,
    },
    {
      name: "Service Level Agreements (SLAs)",
      included: currentPlan === BillingPlanType.ENTERPRISE,
    },
    {
      name: "Advanced Support",
      included: currentPlan === BillingPlanType.ENTERPRISE,
    },
    {
      name: "Custom Integrations",
      included: currentPlan === BillingPlanType.ENTERPRISE,
    },
    {
      name: "Dedicated Account Manager",
      included: currentPlan === BillingPlanType.ENTERPRISE,
    },
  ];

  const [newSeats, setNewSeats] = useState(seats);
  const [newPlan, setNewPlan] = useState(currentPlan);
  const [isOpen, setIsOpen] = useState(false);

  function getBillingPlanIcon(planType: BillingPlanType) {
    switch (planType) {
      case BillingPlanType.FREE:
        return <FiStar />;
      case BillingPlanType.PREMIUM:
        return <FiDollarSign />;
      case BillingPlanType.ENTERPRISE:
        return <FiAward />;
      default:
        return <FiStar />;
    }
  }

  return (
    <div className="max-w-4xl mr-auto space-y-8 p-6">
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            Your Plan
            <svg
              className="w-8 h-8 ml-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-600 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Tier:
              </p>
              <span className="text-xl font-semibold text-blue-600 capitalize">
                {currentPlan}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-600 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Current Seats:
              </p>
              <span className="text-xl font-semibold text-blue-600">
                {seats}
              </span>
            </div>

            <Divider />

            <div className="mt-6 relative">
              <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                New Tier:
              </label>
              <div
                className="w-full px-4 py-2 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="flex items-center">
                  {getBillingPlanIcon(newPlan!)}
                  <span className="ml-2 capitalize">{newPlan}</span>
                </span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {Object.values(BillingPlanType).map((plan) => (
                    <div
                      key={plan}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        setNewPlan(plan);
                        setIsOpen(false);
                        if (plan === BillingPlanType.FREE) {
                          setNewSeats(1);
                        }
                      }}
                    >
                      {getBillingPlanIcon(plan)}
                      <span className="ml-2 capitalize">{plan}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6">
              <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                New Number of Seats:
              </label>
              {newPlan === BillingPlanType.FREE ? (
                <input
                  type="number"
                  value={1}
                  disabled
                  className="w-full px-4 py-2 text-lg border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              ) : (
                <input
                  type="number"
                  value={newSeats}
                  onChange={(e) => setNewSeats(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                />
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <StripeCheckoutButton
                currentPlan={currentPlan}
                currentQuantity={cloudSettings.numberOfSeats}
                newQuantity={newSeats}
                newPlan={newPlan!}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Features</h2>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-lg">
                <span className="mr-3">
                  {feature.included ? (
                    <CheckmarkIcon className="text-success" />
                  ) : (
                    <XIcon className="text-error" />
                  )}
                </span>
                <span
                  className={
                    feature.included ? "text-gray-800" : "text-gray-500"
                  }
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      {currentPlan !== BillingPlanType.FREE && (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Tenant Merging
            </h2>
            <p className="text-gray-600 mb-6">
              Merge your tenant with another to consolidate resources and users.
            </p>
            <div
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
              role="alert"
            >
              <p className="font-bold">Warning:</p>
              <p>Merging tenants will result in the following:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Data from the other tenant will be abandoned</li>
                <li>
                  Billing for the merged tenant will transfer to this account
                </li>
              </ul>
            </div>
            <Button
              onClick={() => {
                alert("not implemented");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
            >
              Start Tenant Merge Process
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
