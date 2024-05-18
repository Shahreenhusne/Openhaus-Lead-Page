import "./form.css"

function Form() {
    return (
        <div className="modal">
            <div className="overlay">
                <div className="content">
                    <form action="" className="form-header">
                        <span class="form-header">Add user</span>
                            <div class="form-input-item">
                                <label class="form-label" for="formBasicText">First Name</label>
                                <span class="asterisk-mark">*</span>
                                <input placeholder="e.g. Kapil" name="first_name" required="" type="text" id="formBasicText" class="form-control" value="">
                                </input>
                                <div class="input-bottom-divider"></div>
                            </div>
                    </form>
               </div>
            </div>
        </div>
    )
}
export default Form; 