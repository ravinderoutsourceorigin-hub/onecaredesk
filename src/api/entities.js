import { base44 } from './base44Client';
import apiClient from './apiClient';

// Use real API client for entities that have backend endpoints
export const Lead = apiClient.Lead;
export const Patient = apiClient.Patient;
export const Caregiver = apiClient.Caregiver;
export const Task = apiClient.Task;
export const Document = apiClient.Document;
export const Appointment = apiClient.Appointment;
export const SignatureRequest = apiClient.Signature;
export const Configuration = apiClient.Configuration;
export const AuditLog = base44.entities.AuditLog;
export const Agency = apiClient.Agency;
export const PricingTier = base44.entities.PricingTier;
export const AgencyInvitation = base44.entities.AgencyInvitation;
export const RoleAssignment = base44.entities.RoleAssignment;
export const AppUser = base44.entities.AppUser;
export const WebhookCall = base44.entities.WebhookCall;
export const FormTemplate = base44.entities.FormTemplate;
export const FormSubmission = base44.entities.FormSubmission;
export const WebhookTest = base44.entities.WebhookTest;

// auth sdk:
export const User = base44.auth;