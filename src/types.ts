export interface HardwareStats {
  tier: string;
  activeProfile: string;
  totalRamGb: number;
  freeRamGb: number;
  usedRamPercent: number;
  cpuCores: number;
  cpuModel: string;
  arch: string;
  platform: string;
  isArm: boolean;
  isTermuxCompatible: boolean;
  loadAverage: number[];
  uptimeHours: number;
  maxContext: number;
  recommendedThreads: number;
  temperatureC?: number;
  thermalState?: 'normal' | 'warm' | 'throttling' | 'critical';
  batteryTempC?: number;
  lmkRiskLevel?: 'low' | 'moderate' | 'high' | 'imminent';
  freeRamMb?: number;
}

export interface TelemetrySample {
  timestamp: string;
  timeLabel: string;
  cpuLoadPercent: number;
  ramUsedPercent: number;
  ramUsedGb: number;
  freeRamMb: number;
  temperatureC: number;
  batteryTempC: number;
  thermalState: 'normal' | 'warm' | 'throttling' | 'critical';
  lmkRiskScore: number;
}

export interface AndroidThermalInfo {
  currentTempC: number;
  batteryTempC: number;
  state: 'normal' | 'warm' | 'throttling' | 'critical';
  governor: string;
  throttlingTriggered: boolean;
  lmkMinFreeMb: number;
  freeRamMb: number;
  lmkRiskLevel: 'low' | 'moderate' | 'high' | 'imminent';
  thermalZones: Array<{ zone: string; tempC: number; type: string }>;
  clusterInfo: {
    littleCores: number;
    bigCores: number;
    primeCores: number;
  };
}

export interface AlertThresholds {
  cpuWarningPercent: number;
  cpuCriticalPercent: number;
  thermalWarningC: number;
  thermalCriticalC: number;
  ramWarningPercent: number;
  soundAlertsEnabled: boolean;
}

export interface StressTestResult {
  durationSec: number;
  baselineCpu: number;
  peakCpu: number;
  baselineTemp: number;
  peakTemp: number;
  tempDelta: number;
  baselineRamGb: number;
  peakRamGb: number;
  thermalThrottlingTriggered: boolean;
  lmkRiskMarginMb: number;
  stabilityScore: number;
  stabilityVerdict: string;
  operationsCompleted: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  completedAt: string;
}

export interface SystemStatus {
  identity: {
    name: string;
    version: string;
    motto: string;
    state: string;
    mode: string;
  };
  hardware: HardwareStats;
  brain: {
    activeModel: {
      fileName: string;
      path: string;
      sizeMb: number;
      activeSince: number;
    } | null;
    activeModelName: string;
  };
  stats: {
    conversations: number;
    messages: number;
    longTermFacts: number;
    documents: number;
    corrections: number;
  };
  timestamp: number;
}

export interface GGUFModel {
  fileName: string;
  filePath: string;
  sizeMb: number;
  sizeGb: number;
  estimatedRamNeededGb: number;
  isCompatible: boolean;
  isActive: boolean;
}

export interface CuratedModel {
  id: string;
  name: string;
  family: string;
  parameters: string;
  quantization: string;
  fileName: string;
  sizeMb: number;
  minRamGb: number;
  recommendedFor: string;
  downloadUrl: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  metadata?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokens?: number;
  created_at: number;
  recalledFacts?: Array<{ category: string; key: string; value: string }>;
  recalledDocs?: Array<{ title: string; snippet: string }>;
  skillExecuted?: {
    skillId: string;
    name: string;
    output: string;
  };
}

export interface LongTermFact {
  id: string;
  category: string;
  key: string;
  value: string;
  confidence: number;
  created_at: number;
  updated_at: number;
}

export interface IngestedDocument {
  id: string;
  title: string;
  topic: string;
  file_size: number;
  created_at: number;
  snippet: string;
}

export interface CorrectionEntry {
  id: string;
  prompt: string;
  original_response: string;
  corrected_response: string;
  reason: string;
  rating: number;
  created_at: number;
}

export interface SkillManifest {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  isActive: boolean;
  permissions: string[];
}

export interface DeviceItem {
  id: string;
  name: string;
  protocol: string;
  status: string;
  type: string;
}

export interface AuditLogItem {
  id: number;
  module: string;
  action: string;
  details: string;
  status: string;
  timestamp: number;
}

export interface ProjectFile {
  path: string;
  size: number;
  content: string;
}
