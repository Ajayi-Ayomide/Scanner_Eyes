
import React, { useState } from "react";

const scanOptions = ["Standard", "Deep", "Quick"];
const freqOptions = ["Daily", "Weekly", "Monthly"];
const themeOptions = ["Dark", "Light", "System Default"];

export default function Settings() {
	const [scanSensitivity, setScanSensitivity] = useState("Standard");
	const [autoScan, setAutoScan] = useState(false);
	const [scanFrequency, setScanFrequency] = useState("Daily");
	const [emailNotif, setEmailNotif] = useState(true);
	const [criticalOnly, setCriticalOnly] = useState(false);
	const [desktopNotif, setDesktopNotif] = useState(true);
	const [theme, setTheme] = useState("Dark");
	const [compact, setCompact] = useState(false);

	return (
		<div className="min-h-screen bg-[#101c2a] text-white font-sans p-8">
			<h2 className="text-2xl font-bold mb-6">Settings</h2>
			{/* Scan Settings */}
			<Card title="Scan Settings">
				<SettingRow label="Scan Sensitivity" desc="Adjust the depth of vulnerability scanning">
					<Dropdown value={scanSensitivity} options={scanOptions} onChange={setScanSensitivity} />
				</SettingRow>
				<SettingRow label="Auto Scan Schedule" desc="Automatically scan devices at regular intervals">
					<Toggle checked={autoScan} onChange={setAutoScan} />
				</SettingRow>
				<SettingRow label="Scan Frequency" desc="How often to perform automatic scans">
					<Dropdown value={scanFrequency} options={freqOptions} onChange={setScanFrequency} />
				</SettingRow>
			</Card>
			{/* Alert Settings */}
			<Card title="Alert Settings">
				<SettingRow label="Email Notifications" desc="Receive alerts via email">
					<Toggle checked={emailNotif} onChange={setEmailNotif} />
				</SettingRow>
				<SettingRow label="Critical Alerts Only" desc="Only notify for critical vulnerabilities">
					<Toggle checked={criticalOnly} onChange={setCriticalOnly} />
				</SettingRow>
				<SettingRow label="Desktop Notifications" desc="Show browser notifications">
					<Toggle checked={desktopNotif} onChange={setDesktopNotif} />
				</SettingRow>
			</Card>
			{/* Appearance */}
			<Card title="Appearance">
				<SettingRow label="Theme" desc="Choose your preferred theme">
					<Dropdown value={theme} options={themeOptions} onChange={setTheme} />
				</SettingRow>
				<SettingRow label="Compact Mode" desc="Reduce spacing for more content">
					<Toggle checked={compact} onChange={setCompact} />
				</SettingRow>
			</Card>
		</div>
	);
}

function Card({ title, children }) {
	return (
		<div className="bg-[#16243a] rounded-xl shadow p-6 mb-8">
			<div className="font-semibold text-lg mb-4">{title}</div>
			<div className="space-y-6">{children}</div>
		</div>
	);
}

function SettingRow({ label, desc, children }) {
	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
			<div className="mb-1 md:mb-0">
				<div className="font-medium text-base">{label}</div>
				<div className="text-xs text-gray-400">{desc}</div>
			</div>
			<div className="flex items-center gap-2">{children}</div>
		</div>
	);
}

function Dropdown({ value, options, onChange }) {
	return (
		<select
			value={value}
			onChange={e => onChange(e.target.value)}
			className="bg-[#22334d] text-white px-3 py-1 rounded-lg focus:outline-none border border-[#22334d] shadow"
		>
			{options.map(opt => (
				<option key={opt} value={opt}>{opt}</option>
			))}
		</select>
	);
}

function Toggle({ checked, onChange }) {
	return (
		<label className="inline-flex items-center cursor-pointer">
			<input
				type="checkbox"
				checked={checked}
				onChange={e => onChange(e.target.checked)}
				className="sr-only peer"
			/>
			<span className="w-10 h-6 bg-[#22334d] rounded-full peer-checked:bg-blue-600 transition relative">
				<span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-gray-400 peer-checked:bg-white transition-transform ${checked ? 'translate-x-4' : ''}`}></span>
			</span>
			<span className="ml-2 text-xs text-gray-300">Enable</span>
		</label>
	);
}