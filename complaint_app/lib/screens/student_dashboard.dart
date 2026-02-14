import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});
  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _catCtrl = TextEditingController();
  String _priority = 'medium';
  bool _isSubmitting = false;
  List<dynamic> _complaints = [];
  bool _isLoading = true;
  final Map<int, TextEditingController> _fbCtrls = {};


  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await SharedPreferences.getInstance();
    _fetchComplaints();
  }

  Future<void> _fetchComplaints() async {
    try {
      final c = await ApiService.getMyComplaints();
      if (mounted) setState(() { _complaints = c; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitComplaint() async {
    if (_titleCtrl.text.isEmpty || _descCtrl.text.isEmpty || _catCtrl.text.isEmpty) {
      _snack('Please fill all fields', err: true); return;
    }
    setState(() => _isSubmitting = true);
    try {
      final r = await ApiService.createComplaint(
        title: _titleCtrl.text.trim(), description: _descCtrl.text.trim(),
        category: _catCtrl.text.trim(), priority: _priority,
      );
      if (mounted) {
        if (r['statusCode'] == 201) {
          _snack('Complaint submitted!');
          _titleCtrl.clear(); _descCtrl.clear(); _catCtrl.clear();
          setState(() => _priority = 'medium');
          _fetchComplaints();
        } else { _snack(r['error'] ?? 'Failed', err: true); }
      }
    } catch (_) { _snack('Connection error', err: true); }
    if (mounted) setState(() => _isSubmitting = false);
  }

  Future<void> _submitFeedback(int id) async {
    final c = _fbCtrls[id];
    if (c == null || c.text.isEmpty) return;
    try {
      await ApiService.addFeedback(id: id, feedback: c.text.trim());
      _snack('Feedback submitted!'); c.clear(); _fetchComplaints();
    } catch (_) { _snack('Failed', err: true); }
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  void _snack(String m, {bool err = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(m), backgroundColor: err ? AppTheme.danger : AppTheme.success,
      behavior: SnackBarBehavior.floating, margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  @override
  void dispose() {
    _titleCtrl.dispose(); _descCtrl.dispose(); _catCtrl.dispose();
    for (final c in _fbCtrls.values) { c.dispose(); }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(child: Column(children: [
          _appBar(),
          Expanded(child: RefreshIndicator(
            onRefresh: _fetchComplaints, color: AppTheme.primaryPurple,
            child: ListView(padding: const EdgeInsets.all(16), children: [
              _form(), const SizedBox(height: 24), _list(),
            ]),
          )),
        ])),
      ),
    );
  }

  Widget _appBar() => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
    child: Row(children: [
      Expanded(child: ShaderMask(
        shaderCallback: (b) => const LinearGradient(colors: [Colors.white, Color(0xFFA5B4FC)]).createShader(b),
        child: const Text('Complaint Management', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
      )),
      Container(
        decoration: BoxDecoration(gradient: AppTheme.dangerGradient, borderRadius: BorderRadius.circular(50)),
        child: Material(color: Colors.transparent, child: InkWell(
          borderRadius: BorderRadius.circular(50), onTap: _logout,
          child: const Padding(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13))),
        )),
      ),
    ]),
  );

  Widget _form() => Container(
    padding: const EdgeInsets.all(24), decoration: AppTheme.glassCard,
    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Submit Complaint', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: AppTheme.textWhite)),
      const SizedBox(height: 20),
      TextField(controller: _titleCtrl, style: const TextStyle(color: Colors.white),
        decoration: const InputDecoration(hintText: 'Complaint Title', prefixIcon: Icon(Icons.title_rounded, color: AppTheme.textMuted))),
      const SizedBox(height: 14),
      TextField(controller: _descCtrl, maxLines: 3, style: const TextStyle(color: Colors.white),
        decoration: const InputDecoration(hintText: 'Description', prefixIcon: Icon(Icons.description_outlined, color: AppTheme.textMuted))),
      const SizedBox(height: 14),
      TextField(controller: _catCtrl, style: const TextStyle(color: Colors.white),
        decoration: const InputDecoration(hintText: 'Category (Electrical, Hostel...)', prefixIcon: Icon(Icons.category_outlined, color: AppTheme.textMuted))),
      const SizedBox(height: 14),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.cardBorder)),
        child: DropdownButtonHideUnderline(child: DropdownButton<String>(
          value: _priority, dropdownColor: AppTheme.darkBg2, isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down, color: AppTheme.textMuted),
          style: const TextStyle(color: Colors.white, fontSize: 16),
          items: ['low','medium','high'].map((p) => DropdownMenuItem(value: p, child: Row(children: [
            Icon(Icons.flag_rounded, color: p=='high'?AppTheme.danger:p=='medium'?AppTheme.warning:AppTheme.success, size: 18),
            const SizedBox(width: 8), Text(p[0].toUpperCase()+p.substring(1)),
          ]))).toList(),
          onChanged: (v) { if (v!=null) setState(()=>_priority=v); },
        )),
      ),
      const SizedBox(height: 24),
      AppTheme.gradientButton(label: 'Submit Complaint', onPressed: _submitComplaint, isLoading: _isSubmitting),
    ]),
  );

  Widget _list() => Container(
    padding: const EdgeInsets.all(24), decoration: AppTheme.glassCard,
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('My Complaints', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: AppTheme.textWhite)),
        Text('${_complaints.length} total', style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
      ]),
      const SizedBox(height: 16),
      if (_isLoading) const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator(color: AppTheme.primaryPurple)))
      else if (_complaints.isEmpty) Center(child: Padding(padding: const EdgeInsets.all(30), child: Column(children: [
        Icon(Icons.inbox_rounded, size: 48, color: Colors.white.withValues(alpha: 0.2)),
        const SizedBox(height: 12), const Text('No complaints found', style: TextStyle(color: AppTheme.textMuted)),
      ])))
      else ..._complaints.map((c) => _card(c)),
    ]),
  );

  Widget _card(dynamic c) {
    final id = c['complaint_id'] as int;
    final status = c['status'] ?? 'pending';
    final fb = c['feedback'];
    if (!_fbCtrls.containsKey(id)) _fbCtrls[id] = TextEditingController();

    return Container(
      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0x1AFFFFFF))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(c['title']??'', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textWhite))),
          AppTheme.statusBadge(status),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          Icon(Icons.category_outlined, size: 14, color: Colors.white.withValues(alpha: 0.4)),
          const SizedBox(width: 4), Text(c['category']??'', style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(width: 16), AppTheme.priorityBadge(c['priority']??'medium'),
        ]),
        const SizedBox(height: 4),
        Text('#$id', style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 12)),
        if (status=='resolved' && fb==null) ...[
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(controller: _fbCtrls[id], style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(hintText: 'Your feedback...', contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10))))),
            const SizedBox(width: 8),
            Container(decoration: BoxDecoration(gradient: AppTheme.successGradient, borderRadius: BorderRadius.circular(10)),
              child: Material(color: Colors.transparent, child: InkWell(borderRadius: BorderRadius.circular(10), onTap: ()=>_submitFeedback(id),
                child: const Padding(padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10), child: Icon(Icons.send_rounded, color: Colors.white, size: 18))))),
          ]),
        ] else if (fb!=null) ...[
          const SizedBox(height: 8),
          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0x1A34D399), borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              const Icon(Icons.feedback_rounded, size: 14, color: AppTheme.success), const SizedBox(width: 6),
              Expanded(child: Text(fb, style: const TextStyle(color: AppTheme.success, fontSize: 13))),
            ])),
        ],
      ]),
    );
  }
}
