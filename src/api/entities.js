import { base44 } from './base44Client';
import apiClient from './apiClient';

// Use real API client for entities that have backend endpoints
export const Lead = base44.entities.Lead;
export const Patient = base44.entities.Patient;
export const Caregiver = apiClient.Caregiver;
export const Task = base44.entities.Task;
export const Document = base44.entities.Document;
export const Appointment = apiClient.Appointment;
export const SignatureRequest = apiClient.Signature;
export const Configuration = apiClient.Configuration;
export const AuditLog = base44.entities.AuditLog;
export const Agency = apiClient.Agency;
export const PricingTier = base44.entities.PricingTier;
export const AgencyInvitation = base44.entities.AgencyInvitation;
export const RoleAssignment = base44.entities.RoleAssignment;
export const AppUser = base44.entities.AppUser;

// auth sdk:
export const User = base44.auth;